import { LogHelper } from "@root/utils"
import { injectable, singleton } from "tsyringe"

import { ConfigManager } from "../config"
import enTranslate from "./utils/en.json"
import ruTranslate from "./utils/ru.json"

export type Lang = "ru" | "en"
export type Translate = typeof ruTranslate | typeof enTranslate

@singleton()
@injectable()
export class LangManager {
    private langList: Map<Lang, Translate> = new Map([
        ["ru", ruTranslate],
        ["en", enTranslate]
    ])
    private currentLang: Translate

    constructor(private readonly configManager: ConfigManager) {
        const selectedLang = configManager.config.lang

        if (!this.langList.has(selectedLang)) {
            LogHelper.error(
                `Invalid lang settings! Language "${selectedLang}" not found. Reset to default...`
            )

            this.configManager.setProp("lang", "en")
        }

        this.currentLang = this.langList.get(selectedLang)

        LogHelper.dev(`LangManager init. Selected language: ${selectedLang}`)
    }

    /**
     * It returns the current language
     * @returns The current language
     */
    get getTranslate(): Translate {
        return this.currentLang
    }

    /**
     * It Changes the current language of the server
     * @param {Lang} lang - The language to change to
     * @returns The current language
     */
    public changeLang(lang: Lang): void {
        if (!this.langList.has(lang))
            return LogHelper.error("Language %s not found!", lang)

        this.currentLang = this.langList.get(lang)
        this.configManager.setProp("lang", lang)

        LogHelper.info(
            "Language has been changed. A complete changes requires restarting LauncherServer"
        )
    }
}
