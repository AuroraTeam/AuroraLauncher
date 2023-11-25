import enTranslate from "./en.json";
import ruTranslate from "./ru.json";

export type Translate = typeof ruTranslate | typeof enTranslate;
export type Lang = "ru" | "en";

export const langList: Map<Lang, Translate> = new Map([
    ["ru", ruTranslate],
    ["en", enTranslate],
]);

export { enTranslate, ruTranslate };
