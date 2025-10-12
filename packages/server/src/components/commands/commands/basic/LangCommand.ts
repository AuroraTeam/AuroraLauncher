import { Service } from "@freshgum/typedi";
import { LogHelper } from "@root/helpers";

import { LangManager } from "../../../langs/LangManager";
import { Lang } from "../../../langs/utils";
import { AbstractCommand, CommandCategory } from "../../AbstractCommand";

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
