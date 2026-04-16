import * as AppleAuthentication from "expo-apple-authentication";

export async function getAppleCredential() {
    return AppleAuthentication.signInAsync({
        requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
    });
}
