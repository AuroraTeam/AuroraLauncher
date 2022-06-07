import { LogHelper } from "../../helpers/LogHelper"
import { Lang } from "../../langs/LangManager"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class LangCommand extends AbstractCommand {
    constructor() {
        super({
            name: "lang",
            description: App.LangManager.getTranslate().CommandsManager.commands.basic.LangCommand,
            category: Category.BASIC,
            usage: "<lang> (ru|en)",
        })
    }

    invoke(...[lang]: [lang: Lang]): void {
        if (!lang) return LogHelper.error("Укажите язык!")
        App.LangManager.changeLang(lang)
    }
}
