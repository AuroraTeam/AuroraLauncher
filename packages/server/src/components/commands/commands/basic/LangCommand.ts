import { Service } from "@freshgum/typedi";
import { AbstractCommand, CommandCategory, Lang, LangManager } from "@root/components";
import { LogHelper } from "@root/helpers";

@Service([LangManager])
export class LangCommand extends AbstractCommand {
    constructor(private readonly langManager: LangManager) {
        super({
            name: "lang",
            description: langManager.getTranslate.CommandsManager.commands.basic.LangCommand,
            category: CommandCategory.BASIC,
            usage: "<lang> (ru|en)",
        });
    }

    invoke(...[lang]: [lang: Lang]): void {
        if (!lang) return LogHelper.error("Укажите язык!");
        this.langManager.changeLang(lang);
    }
}
