import { create } from "zustand";

// made with chat.openai.com

export type RegisterData = {
    email: string;
    password: string;
    phonePrefix: string;
    phoneNumber: string;
    gender: "male" | "female" | "";
    interests: string[];
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    country: string;
    language: string;
    jobTitle: string;
    aboutMe: string;
    acceptedTerms: boolean;
    acceptedPrivacyPolicy: boolean;
};

type PersonalDetailsPayload = {
    phonePrefix: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    country: string;
    language: string;
    jobTitle: string;
    aboutMe: string;
    acceptedTerms: boolean;
    acceptedPrivacyPolicy: boolean;
};

type RegisterStore = {
    data: RegisterData;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    setGender: (gender: "male" | "female") => void;
    setInterests: (interests: string[]) => void;
    setPersonalDetails: (payload: PersonalDetailsPayload) => void;
    reset: () => void;
};

const initialData: RegisterData = {
    email: "",
    password: "",
    phonePrefix: "",
    phoneNumber: "",
    gender: "",
    interests: [],
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    country: "CH",
    language: "de",
    jobTitle: "",
    aboutMe: "",
    acceptedTerms: false,
    acceptedPrivacyPolicy: false,
};

export const useRegisterStore = create<RegisterStore>((set) => ({
    data: initialData,

    setEmail: (email: string) =>
        set((state) => ({
            data: {
                ...state.data,
                email,
            },
        })),

    setPassword: (password: string) =>
        set((state) => ({
            data: {
                ...state.data,
                password,
            },
        })),

    setGender: (gender: "male" | "female") =>
        set((state) => ({
            data: {
                ...state.data,
                gender,
            },
        })),

    setInterests: (interests: string[]) =>
        set((state) => ({
            data: {
                ...state.data,
                interests,
            },
        })),

    setPersonalDetails: (payload: PersonalDetailsPayload) =>
        set((state) => ({
            data: {
                ...state.data,
                ...payload,
            },
        })),

    reset: () =>
        set({
            data: initialData,
        }),
}));
