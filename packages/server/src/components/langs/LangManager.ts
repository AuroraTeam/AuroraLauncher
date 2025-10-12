import { Service } from "@freshgum/typedi";
import { LogHelper } from "@root/helpers";

import { ConfigManager } from "../config/ConfigManager";
import { Lang, Translate, langList } from "./utils";

@Service([ConfigManager])
export class LangManager {
    private currentLang: Translate;

    constructor(private readonly configManager: ConfigManager) {
        const selectedLang = this.validateLanguage(configManager.config.lang);

        this.currentLang = langList.get(selectedLang)!;

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
     * @param {Lang} lang - Язык для изменения
     */
    public changeLang(lang: Lang): void {
        if (!langList.has(lang)) {
            LogHelper.error(this.getTranslate.LangManager.langNotFound, lang);
            return;
        }

        this.currentLang = langList.get(lang)!;
        this.configManager.setProp("lang", lang);

        LogHelper.info(this.getTranslate.LangManager.changeLang);
    }

    /**
     * Проверяет валидность выбранного языка, возвращает 'en' если язык невалидный
     * @param {Lang} lang - Выбранный язык
     * @returns {Lang} Валидный язык
     */
    private validateLanguage(lang: Lang): Lang {
        if (!langList.has(lang)) {
            LogHelper.error(
                'Invalid language settings! Language "%s" not found. Reset to default settings...',
                lang,
            );
            this.configManager.setProp("lang", "en");

            return "en";
        }

        return lang;
    }
}
