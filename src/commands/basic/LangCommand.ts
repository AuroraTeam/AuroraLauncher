import { LogHelper } from "../../helpers/LogHelper"
import { Lang } from "../../langs/LangManager"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class LangCommand extends AbstractCommand {
    constructor() {
        super(
            "lang",
            App.LangManager.getTranslate().CommandsManager.commands.basic.LangCommand,
            Category.BASIC,
            "<lang> (ru|en)"
        )
    }

    invoke(...[lang]: [lang: Lang]): void {
        if (!lang) return LogHelper.error("Укажите язык!")
        App.LangManager.changeLang(lang)
    }
}
