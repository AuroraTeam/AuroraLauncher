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

import { Transform, TransformCallback } from "stream"

import * as cliProgress from "cli-progress"

import { App } from "../LauncherServer"

export class ProgressHelper {
    static barCompleteChar = "\u2588"
    static barIncompleteChar = "\u2591"
    static barsize = 20

    // private static getLoadingProgressTemplate(progress: progress.Progress) {
    //     return App.LangManager.getTranslate("ProgressHelper.loading")
    //         .replace("{bar}", this.getBar(progress.percentage, this.barsize * 2))
    //         .replace("{percent}", progress.percentage.toFixed(2))
    // }

    // private static getDownloadProgressTemplate(progress: progress.Progress) {
    //     return App.LangManager.getTranslate("ProgressHelper.download")
    //         .replace("{bar}", this.getBar(progress.percentage))
    //         .replace("{percent}", progress.percentage.toFixed(2))
    //         .replace("{eta}", progress.eta.toString())
    //         .replace("{speed}", this.bytesToSize(progress.speed))
    //         .replace("{transferred}", this.bytesToSize(progress.transferred))
    //         .replace("{total}", this.bytesToSize(progress.length))
    // }

    // private static getBar(percentage: number, size = 0): string {
    //     // calculate barsize
    //     const barsize = size !== 0 ? size : this.barsize
    //     const completeSize = Math.round((percentage / 100) * barsize)
    //     const incompleteSize = barsize - completeSize

    //     // generate bar string by stripping the pre-rendered strings
    //     return this.barCompleteChar.repeat(completeSize) + this.barIncompleteChar.repeat(incompleteSize)
    // }

    // private static bytesToSize(bytes: number): string {
    //     const sizes = ["Bytes", "KB", "MB"]
    //     if (bytes === 0) return "n/a"
    //     const i = Math.floor(Math.log(bytes) / Math.log(1024))
    //     if (i === 0) return `${bytes} ${sizes[i]})`
    //     return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
    // }

    // New progress

    public static getProgress(format: string, barsize = 0): cliProgress.SingleBar {
        return new cliProgress.SingleBar({
            format,
            barCompleteChar: this.barCompleteChar,
            barIncompleteChar: this.barIncompleteChar,
            barsize: barsize !== 0 ? barsize : this.barsize,
            hideCursor: true,
        })
    }

    public static getMultiProgress(format: string, barsize = 0): cliProgress.MultiBar {
        return new cliProgress.MultiBar({
            format,
            barCompleteChar: this.barCompleteChar,
            barIncompleteChar: this.barIncompleteChar,
            barsize: barsize !== 0 ? barsize : this.barsize,
            hideCursor: true,
        })
    }

    public static getLoadingProgressBar(): cliProgress.SingleBar {
        return this.getProgress(App.LangManager.getTranslate("ProgressHelper.loading"), this.barsize * 2)
    }

    public static getDownloadProgressBar(): cliProgress.SingleBar {
        return this.getProgress(App.LangManager.getTranslate("ProgressHelper.download"))
    }
}
