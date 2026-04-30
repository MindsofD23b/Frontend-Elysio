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
    profilePictureUri: string;
    interestedIn: "male" | "female" | "everyone" | "";
    minPreferredAge: number;
    maxPreferredAge: number;
    city: string;
    latitude: number | null;
    longitude: number | null;
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
    city: string;
    latitude: number | null;
    longitude: number | null;
};

type RegisterStore = {
    data: RegisterData;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    setGender: (gender: "male" | "female") => void;
    setInterestedIn: (interestedIn: "male" | "female" | "everyone") => void;
    setAgePreferences: (min: number, max: number) => void;
    setInterests: (interests: string[]) => void;
    setPersonalDetails: (payload: PersonalDetailsPayload) => void;
    setProfilePictureUri: (uri: string) => void;
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
    profilePictureUri: "",
    aboutMe: "",
    acceptedTerms: false,
    acceptedPrivacyPolicy: false,
    interestedIn: "",
    minPreferredAge: 18,
    maxPreferredAge: 35,
    city: "",
    latitude: null,
    longitude: null,
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

    setInterestedIn: (interestedIn: "male" | "female" | "everyone") =>
        set((state) => ({
            data: {
                ...state.data,
                interestedIn,
            },
        })),

    setAgePreferences: (min: number, max: number) =>
        set((state) => ({
            data: {
                ...state.data,
                minPreferredAge: min,
                maxPreferredAge: max,
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

    setProfilePictureUri: (profilePictureUri: string) =>
        set((state) => ({
            data: { ...state.data, profilePictureUri },
        })),

    reset: () =>
        set({
            data: initialData,
        }),
}));
