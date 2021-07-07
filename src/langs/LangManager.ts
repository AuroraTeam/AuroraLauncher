import { LogHelper } from "../helpers/LogHelper"
import { App } from "../LauncherServer"
import { Translate } from "./Translate"

export type Lang = "ru" | "en"

export class LangManager {
    private langList: Map<Lang, Translate> = new Map()
    private currentLang: Translate

    constructor() {
        this.setLangs()
        const selectedLang = App.ConfigManager.getConfig().lang || "en"

        if (!this.langList.has(selectedLang))
            LogHelper.fatal("Invalid lang settings! Language %s not found.", selectedLang)
        this.currentLang = this.langList.get(selectedLang)

        LogHelper.dev("LangManager init, selected language: %s", selectedLang)
    }

    private setLangs(): void {
        this.langList.set("ru", require("./ru.json"))
        this.langList.set("en", require("./en.json"))
    }

    getTranslate(): Translate {
        return this.currentLang
    }

    changeLang(lang: Lang): any {
        if (!this.langList.has(lang)) return LogHelper.error("Language %s not found!", lang)
        this.currentLang = this.langList.get(lang)
        App.ConfigManager.setProp("lang", lang)
        LogHelper.info("Language changed")
    }
}
