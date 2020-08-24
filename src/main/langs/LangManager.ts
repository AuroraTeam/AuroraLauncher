import { LogHelper } from "../helpers/LogHelper"
import { App } from "../LauncherServer"

export class LangManager {
    langList: Map<string, Object> = new Map()
    currentLang: string = App.ConfigManager.getProperty("lang", true) || "en"

    constructor() {
        this.langList.set("ru", require("./ru.json"))
        this.langList.set("en", require("./en.json"))
        LogHelper.dev("LangManager init, selected language: %s", this.currentLang)
    }

    getTranslate(langString: string): string {
        const path = langString.split(".")
        let dictionary: any = this.langList.get(this.currentLang)
        path.forEach((el) => {
            dictionary = dictionary[el]
            if (dictionary === undefined) LogHelper.fatal(this.getTranslate("LangManager.strNotFound"), langString)
        })
        return dictionary
    }
}
