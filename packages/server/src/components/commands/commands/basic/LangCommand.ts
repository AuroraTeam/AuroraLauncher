import { Lang, LangManager } from "@root/components";
import { AbstractCommand, Category, LogHelper } from "@root/utils";
import { injectable } from "tsyringe";

@injectable()
export class LangCommand extends AbstractCommand {
    constructor(private readonly langManager: LangManager) {
        super({
            name: "lang",
            description: langManager.getTranslate.CommandsManager.commands.basic.LangCommand,
            category: Category.BASIC,
            usage: "<lang> (ru|en)",
        });
    }

    invoke(...[lang]: [lang: Lang]): void {
        if (!lang) return LogHelper.error("Укажите язык!");
        this.langManager.changeLang(lang);
    }
}
