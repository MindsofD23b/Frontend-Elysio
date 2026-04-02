import * as SecureStore from "expo-secure-store";
import { RSA } from "react-native-rsa-native";
import AesGcmCrypto from "react-native-aes-gcm-crypto";

const PRIVATE_KEY_STORE_KEY = "chat_private_key";
const PUBLIC_KEY_STORE_KEY = "chat_public_key";

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
    const aesKeyBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)));
    const aesKeyBase64 = btoa(String.fromCharCode(...aesKeyBytes));

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
    const privateKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORE_KEY);
    if (!privateKey) throw new Error("Kein Private Key gefunden");

    const aesKeyBase64 = await RSA.decrypt(msg.encryptedKey, privateKey);

    const plainText = await AesGcmCrypto.decrypt(
        msg.ciphertext,
        aesKeyBase64,
        msg.iv,
        msg.authTag,
        false,
    );

    return plainText;
}
