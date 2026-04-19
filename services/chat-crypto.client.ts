import * as SecureStore from "expo-secure-store";
import { RSA } from "react-native-rsa-native";
import {
    AESEncryptionKey,
    AESSealedData,
    aesEncryptAsync,
    aesDecryptAsync,
} from "expo-crypto";
import { Message, RoomMessagesResponse } from "@/types/messages";

const PRIVATE_KEY_STORE_KEY = "chat_private_key";
const PUBLIC_KEY_STORE_KEY = "chat_public_key";

let cachedPrivateKey: string | null = null;
const aesKeyCache = new Map<string, AESEncryptionKey>();

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
    const aesKey = await AESEncryptionKey.generate(256);
    const aesKeyBase64 = await aesKey.encoded("base64");

    const plaintextBase64 = btoa(unescape(encodeURIComponent(plainText)));

    const sealedData = await aesEncryptAsync(plaintextBase64, aesKey);

    const iv = (await sealedData.iv("base64")) as string;
    const authTag = (await sealedData.tag("base64")) as string;
    const ciphertext = (await sealedData.ciphertext({
        encoding: "base64",
        includeTag: false,
    })) as string;

    const encryptedKeys = await Promise.all(
        recipients.map(async (r) => ({
            userId: r.userId,
            encryptedKey: await RSA.encrypt(aesKeyBase64, r.publicKey),
        })),
    );

    return {
        type: "text",
        ciphertext,
        iv,
        authTag,
        encryptedKeys,
    };
}

export async function decryptMessage(msg: {
    ciphertext: string;
    iv: string;
    authTag: string;
    encryptedKey: string;
}): Promise<string> {
    if (!cachedPrivateKey) {
        cachedPrivateKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORE_KEY);
    }
    if (!cachedPrivateKey) throw new Error("Kein Private Key gefunden");

    let aesKey = aesKeyCache.get(msg.encryptedKey);
    if (!aesKey) {
        const aesKeyBase64 = await RSA.decrypt(msg.encryptedKey, cachedPrivateKey);
        aesKey = await AESEncryptionKey.import(aesKeyBase64, "base64");
        aesKeyCache.set(msg.encryptedKey, aesKey);
    }

    const sealedData = AESSealedData.fromParts(msg.iv, msg.ciphertext, msg.authTag);

    const decryptedBase64 = (await aesDecryptAsync(sealedData, aesKey, {
        output: "base64",
    })) as string;

    return decodeURIComponent(escape(atob(decryptedBase64)));
}

async function prewarmAesCache(messages: RoomMessagesResponse["messages"]) {
    const uniqueKeys = [...new Set(messages.map((m) => m.encryptedKey).filter(Boolean))];

    if (!cachedPrivateKey) {
        cachedPrivateKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORE_KEY);
    }
    if (!cachedPrivateKey) {
        throw new Error("Kein Private Key gefunden");
    }

    const privateKey = cachedPrivateKey;

    await Promise.all(
        uniqueKeys.map(async (encKey) => {
            if (encKey && !aesKeyCache.has(encKey)) {
                const aesKeyBase64 = await RSA.decrypt(encKey, privateKey);
                const aesKey = await AESEncryptionKey.import(aesKeyBase64, "base64");
                aesKeyCache.set(encKey, aesKey);
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
