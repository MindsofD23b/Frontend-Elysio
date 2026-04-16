import * as SecureStore from "expo-secure-store";
import { RSA } from "react-native-rsa-native";
import AesGcmCrypto from "react-native-aes-gcm-crypto";
import * as Crypto from "expo-crypto";
import { Message, RoomMessagesResponse } from "@/types/messages";

const PRIVATE_KEY_STORE_KEY = "chat_private_key";
const PUBLIC_KEY_STORE_KEY = "chat_public_key";

let cachedPrivateKey: string | null = null;
const aesKeyCache = new Map<string, string>(); // encryptedKey → decryptedAesKey

export interface EncryptedPayload {
    type: "text";
    ciphertext: string;
    iv: string;
    authTag: string;
    encryptedKeys: { userId: string; encryptedKey: string }[];
}

export async function initCrypto(apiBaseUrl: string, authToken: string): Promise<void> {
    let publicKey: string;

    const existingPrivate = await SecureStore.getItemAsync(PRIVATE_KEY_STORE_KEY);
    const existingPublic = await SecureStore.getItemAsync(PUBLIC_KEY_STORE_KEY);

    if (existingPrivate && existingPublic) {
        publicKey = existingPublic;
    } else {
        const keys = await RSA.generateKeys(2048);
        await SecureStore.setItemAsync(PRIVATE_KEY_STORE_KEY, keys.private);
        await SecureStore.setItemAsync(PUBLIC_KEY_STORE_KEY, keys.public);
        publicKey = keys.public;
    }

    const res = await fetch(`${apiBaseUrl}/users/me/public-key`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ publicKey }),
    });

    if (!res.ok) {
        throw new Error("Public key upload failed");
    }
}

export async function encryptMessage(
    plainText: string,
    recipients: { userId: string; publicKey: string }[],
): Promise<EncryptedPayload> {
    const keyBytes = Crypto.getRandomValues(new Uint8Array(32));
    const aesKeyBase64 = bytesToBase64(keyBytes);

    const encrypted = await AesGcmCrypto.encrypt(plainText, false, aesKeyBase64);

    const encryptedKeys = await Promise.all(
        recipients.map(async (r) => ({
            userId: r.userId,
            encryptedKey: await RSA.encrypt(aesKeyBase64, r.publicKey),
        })),
    );

    return {
        type: "text",
        ciphertext: encrypted.content,
        iv: encrypted.iv,
        authTag: encrypted.tag,
        encryptedKeys,
    };
}

// ─── 3. Nachricht entschlüsseln ──────────────────────────────────────────────

export async function decryptMessage(msg: {
    ciphertext: string;
    iv: string;
    authTag: string;
    encryptedKey: string;
}): Promise<string> {
    // Cache private key — only 1 disk read ever
    if (!cachedPrivateKey) {
        cachedPrivateKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORE_KEY);
    }
    if (!cachedPrivateKey) throw new Error("Kein Private Key gefunden");

    // Cache AES key — RSA decrypt only once per unique encrypted key
    let aesKeyBase64 = aesKeyCache.get(msg.encryptedKey);
    if (!aesKeyBase64) {
        aesKeyBase64 = await RSA.decrypt(msg.encryptedKey, cachedPrivateKey);
        aesKeyCache.set(msg.encryptedKey, aesKeyBase64);
    }

    const plainText = await AesGcmCrypto.decrypt(
        msg.ciphertext,
        aesKeyBase64,
        msg.iv,
        msg.authTag,
        false,
    );
    return plainText;
}

async function prewarmAesCache(messages: RoomMessagesResponse["messages"]) {
    const uniqueKeys = [...new Set(messages.map((m) => m.encryptedKey).filter(Boolean))];

    if (!cachedPrivateKey) {
        cachedPrivateKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORE_KEY);
    }

    await Promise.all(
        uniqueKeys.map(async (encKey) => {
            if (!aesKeyCache.has(encKey!)) {
                const aesKey = await RSA.decrypt(encKey!, cachedPrivateKey!);
                aesKeyCache.set(encKey!, aesKey);
            }
        }),
    );
}

export async function decryptBatch(
    messages: RoomMessagesResponse["messages"],
): Promise<Message[]> {
    await prewarmAesCache(messages);
    return await Promise.all(
        messages.map(async (msg) => {
            let text = "[Encrypted message]";
            if (msg.type !== "text") {
                text = "Voice message";
            } else if (msg.encryptedKey) {
                try {
                    text = await decryptMessage({
                        ciphertext: msg.ciphertext,
                        iv: msg.iv,
                        authTag: msg.authTag,
                        encryptedKey: msg.encryptedKey,
                    });
                } catch {
                    text = "[Unable to decrypt]";
                }
            }
            return {
                id: msg.id,
                senderId: msg.senderId,
                text,
                createdAt: msg.createdAt,
            };
        }),
    );
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
