/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { LogHelper } from "../helpers/LogHelper"
import { App } from "../LauncherServer"
import { Translate } from "./Translate"

export type Lang = "ru" | "en"

export class LangManager {
    private langList: Map<Lang, Translate> = new Map()
    private currentLang: Translate

    constructor() {
        this.setLangs()
        const selectedLang = App.ConfigManager.getConfig().lang || "en"

        if (!this.langList.has(selectedLang)) LogHelper.fatal("Invalid lang settings! Language %s not found.", selectedLang)
        this.currentLang = this.langList.get(selectedLang)

        LogHelper.dev("LangManager init, selected language: %s", selectedLang)
    }

    private setLangs(): void {
        this.langList.set("ru", require("./ru.json"))
        this.langList.set("en", require("./en.json"))
    }

    getTranslate(): Translate {
        return this.currentLang
    }

    changeLang(lang: Lang): boolean {
        if (!this.langList.has(lang)) return false
        this.currentLang = this.langList.get(lang)
        App.ConfigManager.setLang(lang)
        return true
    }
}
