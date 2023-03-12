import { LogHelper } from "@root/utils";
import { injectable, singleton } from "tsyringe";

import { ConfigManager } from "../config";
import enTranslate from "./utils/en.json";
import ruTranslate from "./utils/ru.json";

export type Translate = typeof ruTranslate | typeof enTranslate;

@singleton()
@injectable()
export class LangManager {
    private langList: Map<string, Translate> = new Map([
        ["ru", ruTranslate],
        ["en", enTranslate],
    ]);
    private currentLang: Translate;

    constructor(private readonly configManager: ConfigManager) {
        const selectedLang = configManager.config.lang;

        if (!this.langList.has(selectedLang)) {
            LogHelper.error(
                'Invalid language settings! Language "%s" not found. Reset to default settings...',
                selectedLang
            );
            this.configManager.setProp("lang", "en");
        }

        this.currentLang = this.langList.get(selectedLang);

        LogHelper.dev(this.getTranslate.LangManager.init, selectedLang);
    }

    /**
     * Возвращает перевод для текущего языка
     * @returns Перевод
     */
    get getTranslate(): Translate {
        return this.currentLang;
    }

    /**
     * Изменяет текущий язык
     * @param {string} lang - Язык для изменения
     */
    public changeLang(lang: string): void {
        if (!this.langList.has(lang)) {
            LogHelper.error(this.getTranslate.LangManager.langNotFound, lang);
            return;
        }

        this.currentLang = this.langList.get(lang);
        this.configManager.setProp("lang", lang);

        LogHelper.info(this.getTranslate.LangManager.changeLang);
    }
}
