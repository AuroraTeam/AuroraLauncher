import * as ruLang from "./ru.json";
import * as enLang from "./en.json";
import { App } from "../LauncherServer";
import { LogHelper } from "../helpers/LogHelper";

export class LangManager {
    langList: Map<string, Object> = new Map
    currentLang: string = App.ConfigManager.getProperty("lang")

    constructor() {
        this.langList.set("ru", ruLang)
        this.langList.set("en", enLang)
    }

    getTranslate(langString: string): string {
        const path = langString.split(".")
        let dictionary: any  = this.langList.get(this.currentLang)
        path.forEach((el) => {
            dictionary = dictionary[el]
            if (dictionary === undefined) LogHelper.fatal(`String ${langString} not found!`)
        })
        return dictionary
    }
}
