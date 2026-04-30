import * as WebBrowser from "expo-web-browser";
import { Theme } from "@/lib/theme/theme";

export const BROWSER_OPTS = (
    theme: Theme,
): Parameters<typeof WebBrowser.openBrowserAsync>[1] => ({
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
    controlsColor: theme.primary,
    toolbarColor: theme.background,
    enableBarCollapsing: true,
});
