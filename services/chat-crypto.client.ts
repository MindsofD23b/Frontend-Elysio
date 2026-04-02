import * as SecureStore from "expo-secure-store";
import { RSA } from "react-native-rsa-native";
import Aes from "react-native-aes-crypto";

const PRIVATE_KEY_STORE_KEY = "chat_private_key";
const PUBLIC_KEY_STORE_KEY = "chat_public_key";

// ─── 1. Init (einmal nach Login) ─────────────────────────────────────────────

export async function initCrypto(apiBaseUrl: string, authToken: string): Promise<void> {
    const existing = await SecureStore.getItemAsync(PRIVATE_KEY_STORE_KEY);
    if (existing) return;

    const keys = await RSA.generateKeys(2048);
    await SecureStore.setItemAsync(PRIVATE_KEY_STORE_KEY, keys.private);
    await SecureStore.setItemAsync(PUBLIC_KEY_STORE_KEY, keys.public);

    await fetch(`${apiBaseUrl}/users/me/public-key`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ publicKey: keys.public }),
    });
}

// ─── 2. Nachricht verschlüsseln ──────────────────────────────────────────────

export interface EncryptedPayload {
    type: "text";
    ciphertext: string; // Base64
    iv: string; // Base64
    authTag: string; // leer bei AES-CBC, für Server-Kompatibilität
    encryptedKeys: { userId: string; encryptedKey: string }[];
}

export async function encryptMessage(
    plainText: string,
    recipients: { userId: string; publicKey: string }[],
): Promise<EncryptedPayload> {
    // Zufälligen AES-256 Key + IV generieren
    const aesKey = await Aes.randomKey(32); // 32 bytes = 256 bit, gibt Base64 zurück
    const iv = await Aes.randomKey(16); // 16 bytes IV

    // Nachricht mit AES-256-CBC verschlüsseln
    const ciphertext = await Aes.encrypt(plainText, aesKey, iv, "aes-256-cbc");

    // AES Key für jeden Empfänger mit dessen RSA Public Key verschlüsseln
    const encryptedKeys = await Promise.all(
        recipients.map(async (r) => ({
            userId: r.userId,
            encryptedKey: await RSA.encrypt(aesKey, r.publicKey),
        })),
    );

    return {
        type: "text",
        ciphertext,
        iv,
        authTag: "", // AES-CBC hat kein authTag
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

    // AES Key mit RSA Private Key entschlüsseln
    const aesKey = await RSA.decrypt(msg.encryptedKey, privateKey);

    // Nachricht mit AES entschlüsseln
    const plainText = await Aes.decrypt(msg.ciphertext, aesKey, msg.iv, "aes-256-cbc");

    return plainText;
}
