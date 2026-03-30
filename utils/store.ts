import AsyncStorage from "@react-native-async-storage/async-storage";

export async function get<T>(key: string): Promise<T | null> {
    try {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function store<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
}
