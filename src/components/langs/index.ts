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
            LogHelper.error("Invalid language settings! Language \"%s\" not found. Reset to default settings...", selectedLang)

            this.configManager.setProp("lang", "en")
        }

        this.currentLang = this.langList.get(selectedLang)

        LogHelper.dev(this.getTranslate.LangManager.init, selectedLang)
    }

    /**
     * It returns translate for selected language
     * @returns The translate
     */
    get getTranslate(): Translate {
        return this.currentLang
    }

    /**
     * It Changes the current language of the LauncherServer
     * @param {Lang} lang - The language to change to
     * @returns The current language
     */
    public changeLang(lang: Lang): void {
        if (!this.langList.has(lang))
            return LogHelper.error(this.getTranslate.LangManager.langNotFound, lang)

        this.currentLang = this.langList.get(lang)
        this.configManager.setProp("lang", lang)

        LogHelper.info(this.getTranslate.LangManager.changeLang)
    }
}
