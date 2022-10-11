import { LogHelper } from "@root/utils"
import { App } from "@root/app"

import enTranslate from "./utils/en.json"
import ruTranslate from "./utils/ru.json"

export type Lang = "ru" | "en"
export type Translate = typeof ruTranslate | typeof enTranslate

export class LangManager {
    private langList: Map<Lang, Translate> = new Map()
    private currentLang: Translate

    constructor() {
        this.setLangs()
        const selectedLang = App.ConfigManager.getConfig.lang

        if (!this.langList.has(selectedLang)) {
            LogHelper.fatal(`Invalid lang settings! Language "${selectedLang}" not found.`)
        }

        this.currentLang = this.langList.get(selectedLang)

        LogHelper.dev(`LangManager init. Selected language: ${selectedLang}`)
    }

    /**
     * It sets the language list.
     */
    private setLangs(): void {
        this.langList.set("ru", ruTranslate).set("en", enTranslate)
    }

    /**
     * It returns the current language
     * @returns The current language
     */
    get getTranslate(): Translate {
        return this.currentLang
    }

    /**
     * It Change the current language of the server
     * @param {Lang} lang - The language to change to
     * @returns The current language
     */
    public changeLang(lang: Lang): void {
        if (!this.langList.has(lang)) return LogHelper.error("Language %s not found!", lang)

        this.currentLang = this.langList.get(lang)
        App.ConfigManager.setProp("lang", lang)

        LogHelper.info("Language has been changed. A complete change requires a restart LauncherServer")
    }
}
