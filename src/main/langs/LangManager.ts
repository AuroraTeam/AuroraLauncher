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

// Я горел и пытался как-то реализовать нормально, но безуспешно, так что пока оставил как есть
// Пошло оно в очко, пускай остаётся так

import { LogHelper } from "../helpers/LogHelper"
import { App } from "../LauncherServer"

export class LangManager {
    langList: Map<string, Object> = new Map()
    currentLang: string = App.ConfigManager.getConfig().lang || "en"

    constructor() {
        this.langList.set("ru", require("./ru.json"))
        this.langList.set("en", require("./en.json"))
        LogHelper.dev("LangManager init, selected language: %s", this.currentLang)
    }

    getTranslate(langString: string): string {
        const path = langString.split(".")
        let dictionary: any = this.langList.get(this.currentLang)
        path.forEach((el) => {
            dictionary = dictionary[el]
            if (dictionary === undefined) LogHelper.fatal(this.getTranslate("LangManager.strNotFound"), langString)
        })
        return dictionary
    }
}
