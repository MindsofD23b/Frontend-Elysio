import { create } from "zustand";

export type CompleteProfileData = {
    firstName: string;
    lastName: string;
    gender: "male" | "female" | "";
    interestedIn: "male" | "female" | "everyone" | "";
    minPreferredAge: number;
    maxPreferredAge: number;
    interests: string[];
    dateOfBirth: string;
    country: string;
    language: string;
    jobTitle: string;
    aboutMe: string;
    city: string;
    phonePrefix: string;
    phoneNumber: string;
    acceptedTerms: boolean;
    acceptedPrivacyPolicy: boolean;
    profilePictureUri: string;
};

type CompleteProfileStore = {
    data: CompleteProfileData;
    seed: (partial: Partial<CompleteProfileData>) => void;
    setGender: (gender: "male" | "female") => void;
    setInterestedIn: (v: "male" | "female" | "everyone") => void;
    setAgePreferences: (min: number, max: number) => void;
    setInterests: (interests: string[]) => void;
    setPersonalDetails: (v: Partial<CompleteProfileData>) => void;
    setProfilePictureUri: (uri: string) => void;
    reset: () => void;
};

const initial: CompleteProfileData = {
    firstName: "",
    lastName: "",
    gender: "",
    interestedIn: "",
    minPreferredAge: 18,
    maxPreferredAge: 35,
    interests: [],
    dateOfBirth: "",
    country: "CH",
    language: "en",
    jobTitle: "",
    aboutMe: "",
    city: "",
    phonePrefix: "",
    phoneNumber: "",
    acceptedTerms: false,
    acceptedPrivacyPolicy: false,
    profilePictureUri: "",
};

export const useCompleteProfileStore = create<CompleteProfileStore>((set) => ({
    data: initial,

    seed: (partial) => set((state) => ({ data: { ...state.data, ...partial } })),

    setGender: (gender) => set((state) => ({ data: { ...state.data, gender } })),

    setInterestedIn: (interestedIn) =>
        set((state) => ({ data: { ...state.data, interestedIn } })),

    setAgePreferences: (min, max) =>
        set((state) => ({
            data: { ...state.data, minPreferredAge: min, maxPreferredAge: max },
        })),

    setInterests: (interests) => set((state) => ({ data: { ...state.data, interests } })),

    setPersonalDetails: (v) => set((state) => ({ data: { ...state.data, ...v } })),

    setProfilePictureUri: (profilePictureUri) =>
        set((state) => ({ data: { ...state.data, profilePictureUri } })),

    reset: () => set({ data: initial }),
}));
