import { LogHelper } from "../helpers/LogHelper"
import { App } from "../LauncherServer"
import enTranslate from "./en.json"
import ruTranslate from "./ru.json"

export type Lang = "ru" | "en"
export type Translate = typeof ruTranslate

export class LangManager {
    private langList: Map<Lang, Translate> = new Map()
    private currentLang: Translate

    constructor() {
        this.setLangs()
        const selectedLang = App.ConfigManager.getConfig().lang

        if (!this.langList.has(selectedLang))
            LogHelper.fatal(`Invalid lang settings! Language "${selectedLang}" not found.`)
        this.currentLang = this.langList.get(selectedLang)

        LogHelper.dev(`LangManager init, selected language: ${selectedLang}`)
    }

    private setLangs(): void {
        this.langList.set("ru", ruTranslate)
        this.langList.set("en", enTranslate)
    }

    public getTranslate(): Translate {
        return this.currentLang
    }

    public changeLang(lang: Lang): any {
        if (!this.langList.has(lang)) return LogHelper.error("Language %s not found!", lang)
        this.currentLang = this.langList.get(lang)
        App.ConfigManager.setProp("lang", lang)
        LogHelper.info("Language changed")
    }
}
