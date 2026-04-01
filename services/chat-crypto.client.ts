import * as SecureStore from "expo-secure-store";
import { RSA } from "react-native-rsa-native";

const PRIVATE_KEY_STORE_KEY = "chat_private_key";
const PUBLIC_KEY_STORE_KEY = "chat_public_key";

export async function initCrypto(apiBaseUrl: string, authToken: string): Promise<void> {
    const existing = await SecureStore.getItemAsync(PRIVATE_KEY_STORE_KEY);
    if (existing) return;

    const keys = await RSA.generateKeys(2048);

    await SecureStore.setItemAsync(PRIVATE_KEY_STORE_KEY, keys.private);
    await SecureStore.setItemAsync(PUBLIC_KEY_STORE_KEY, keys.public);

    // Public Key an Server schicken
    await fetch(`${apiBaseUrl}/users/me/public-key`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ publicKey: keys.public }),
    });
}

export interface EncryptedPayload {
    type: "text";
    ciphertext: string;
    iv: string;
    authTag: string;
    encryptedKeys: { userId: string; encryptedKey: string }[];
}

/**
 * @param plainText
 * @param recipients
 */
export async function encryptMessage(
    plainText: string,
    recipients: { userId: string; publicKey: string }[],
): Promise<EncryptedPayload> {
    const aesKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encoder.encode(plainText),
    );

    const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);

    const ciphertextBytes = encrypted.slice(0, encrypted.byteLength - 16);
    const authTagBytes = encrypted.slice(encrypted.byteLength - 16);

    const encryptedKeys = await Promise.all(
        recipients.map(async (r) => ({
            userId: r.userId,
            encryptedKey: await rsaEncrypt(r.publicKey, rawAesKey),
        })),
    );

    return {
        type: "text",
        ciphertext: bufferToBase64(ciphertextBytes),
        iv: bufferToBase64(iv.buffer),
        authTag: bufferToBase64(authTagBytes),
        encryptedKeys,
    };
}

/**
 * @param msg
 */
export async function decryptMessage(msg: {
    ciphertext: string;
    iv: string;
    authTag: string;
    encryptedKey: string;
}): Promise<string> {
    const privateKeyPem = await SecureStore.getItemAsync(PRIVATE_KEY_STORE_KEY);
    if (!privateKeyPem) throw new Error("Kein Private Key gefunden");

    const rawAesKey = await rsaDecrypt(privateKeyPem, msg.encryptedKey);

    const aesKey = await crypto.subtle.importKey(
        "raw",
        rawAesKey,
        { name: "AES-GCM" },
        false,
        ["decrypt"],
    );

    const ciphertextBytes = base64ToBuffer(msg.ciphertext);
    const authTagBytes = base64ToBuffer(msg.authTag);
    const combined = new Uint8Array(ciphertextBytes.byteLength + authTagBytes.byteLength);
    combined.set(new Uint8Array(ciphertextBytes));
    combined.set(new Uint8Array(authTagBytes), ciphertextBytes.byteLength);

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: base64ToBuffer(msg.iv) },
        aesKey,
        combined,
    );

    return new TextDecoder().decode(decrypted);
}

async function rsaEncrypt(publicKeyPem: string, data: ArrayBuffer): Promise<string> {
    const key = await crypto.subtle.importKey(
        "spki",
        pemToBuffer(publicKeyPem),
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"],
    );
    const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, data);
    return bufferToBase64(encrypted);
}

async function rsaDecrypt(
    privateKeyPem: string,
    encryptedBase64: string,
): Promise<ArrayBuffer> {
    const key = await crypto.subtle.importKey(
        "pkcs8",
        pemToBuffer(privateKeyPem),
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"],
    );
    return crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        key,
        base64ToBuffer(encryptedBase64),
    );
}

function pemToBuffer(pem: string): ArrayBuffer {
    const b64 = pem
        .replace(/-----BEGIN .+-----/, "")
        .replace(/-----END .+-----/, "")
        .replace(/\s/g, "");
    return base64ToBuffer(b64);
}

function bufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

//Beispiel-Verwendung
/*
// App Start:
await initCrypto('https://api.example.com', userToken);

// Nachricht senden:
const keys = await fetch(`/chat/rooms/${roomId}/keys`, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.json());

const payload = await encryptMessage('Hallo!', keys);

await fetch(`/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
});

// Nachricht empfangen + entschlüsseln:
const { messages } = await fetch(`/chat/rooms/${roomId}/messages`).then(r => r.json());
for (const msg of messages) {
    const plainText = await decryptMessage(msg);
    console.log(plainText);
}
*/
