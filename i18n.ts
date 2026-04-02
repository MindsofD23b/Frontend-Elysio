import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
// all language files made by claud ai
import en from "./locales/en.json";

// types created with claude.ai
type GetNested<T, Path extends string> = Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
        ? GetNested<T[Key], Rest>
        : never
    : Path extends keyof T
      ? T[Path]
      : T;

type DotPaths<T> = T extends object
    ? {
          [K in keyof T & string]: T[K] extends object
              ? `${K}` | `${K}.${DotPaths<T[K]>}`
              : K;
      }[keyof T & string]
    : never;

/** All valid dot-notation keys in the translation file */
export type I18nKey = DotPaths<typeof en>;

/** Keys available under a specific translation scope, for use in scoped t() functions */
export type I18nScopedKey<Scope extends string> = {
    [K in keyof GetNested<typeof en, Scope> & string]: GetNested<
        typeof en,
        Scope
    >[K] extends object
        ? `${K}` | `${K}.${I18nScopedKey<`${Scope}.${K}`>}`
        : K;
}[keyof GetNested<typeof en, Scope> & string];

export function createT<Path extends string>(scope: Path) {
    return (key: I18nScopedKey<Path>, options?: Record<string, unknown>) =>
        i18n.t(`${scope}.${key}`, options);
}
const i18n = new I18n({
    en,
});

const supported = ["en"];
let deviceLocale = "en";
try {
    deviceLocale = getLocales()[0]?.languageCode ?? "en";
} catch {
    // Native module not available (web or pre-initialization)
}
i18n.locale = supported.includes(deviceLocale) ? deviceLocale : "en";
i18n.defaultLocale = "en";
i18n.enableFallback = true;

export default i18n;
