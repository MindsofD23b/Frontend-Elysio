export type Chat = {
    id: string;
    otherUser: {
        id: string;
        fullName: string;
        avatar: string | null;
    };
    name: string;
    lastMessage: string;
    createdAt: string;
    updatedAt: string;
    image: string | null;
};
