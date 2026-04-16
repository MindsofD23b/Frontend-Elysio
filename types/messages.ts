export interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: string;
    hideTime: boolean;
}

export interface RoomMessagesResponse {
    messages: {
        id: string;
        roomId: string;
        senderId: string;
        type: string;
        ciphertext: string;
        iv: string;
        authTag: string;
        mediaUrl: string | null;
        mediaDurationSec: number | null;
        isDeleted: boolean;
        createdAt: string;
        encryptedKey: string | null;
    }[];
    hasMore: boolean;
    nextCursor: string | null;
}

export type RoomKeysResponse = {
    userId: string;
    publicKey: string;
}[];
