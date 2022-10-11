import { App } from "@root/app"
import { Lang } from "@root/components"
import { AbstractCommand, Category, LogHelper } from "@root/utils"

export class LangCommand extends AbstractCommand {
    constructor() {
        super({
            name: "lang",
            description:
                App.LangManager.getTranslate.CommandsManager.commands.basic
                    .LangCommand,
            category: Category.BASIC,
            usage: "<lang> (ru|en)",
        })
    }

    invoke(...[lang]: [lang: Lang]): void {
        if (!lang) return LogHelper.error("Укажите язык!")
        App.LangManager.changeLang(lang)
    }
}
