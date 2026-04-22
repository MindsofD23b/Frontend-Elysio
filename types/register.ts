export type RegisterResponse = {
    message?: string;
    error?: string;
    statusCode?: number;
    userId?: string;
};

export type ProfileDataFormErrors = {
    fullName?: { message: string };
    phoneNumber?: { message: string };
    dateOfBirth?: { message: string };
    jobTitle?: { message: string };
    aboutMe?: { message: string };
    acceptedTerms?: { message: string };
    acceptedPrivacyPolicy?: { message: string };
    general?: { message: string };
};

export type EmailFormErrors = {
    email?: { message: string };
    general?: { message: string };
};

export type PasswordErrors = {
    password?: { message: string };
    confPassword?: { message: string };
};

export type GenderType = "male" | "female";

export type InterestItem = {
    id: string;
    name: string;
};

export type ActivitiesByTitle = Record<string, InterestItem[]>;
