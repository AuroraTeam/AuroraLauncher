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

import { Format, GenericFormatter, MultiBar, Options, Params, SingleBar } from "cli-progress"

import { App } from "../LauncherServer"

export class ProgressHelper {
    static barCompleteChar = "\u2588"
    static barIncompleteChar = "\u2591"
    static barsize = 20

    public static getLoadingProgressBar(): SingleBar {
        return this.getProgress(App.LangManager.getTranslate("ProgressHelper.loading"), this.barsize * 2)
    }

    public static getDownloadProgressBar(): SingleBar {
        return this.getProgress(this.downloadFormatter)
    }

    public static getDownloadMultiProgressBar(): MultiBar {
        return this.getMultiProgress(this.downloadFormatter)
    }

    private static getProgress(format: string | GenericFormatter, barsize = 0): SingleBar {
        return new SingleBar(this.getDefaultParams(format, barsize))
    }

    private static getMultiProgress(format: string | GenericFormatter, barsize = 0): MultiBar {
        return new MultiBar(this.getDefaultParams(format, barsize))
    }

    private static getDefaultParams(format: string | GenericFormatter, barsize: number): Options {
        return {
            format,
            barCompleteChar: this.barCompleteChar,
            barIncompleteChar: this.barIncompleteChar,
            barsize: barsize !== 0 ? barsize : this.barsize,
            hideCursor: true,
            clearOnComplete: true,
            stopOnComplete: true,
            autopadding: true,
            emptyOnZero: true,
        }
    }

    private static downloadFormatter(options: Options, params: Params, payload: any) {
        // Костылинг типов, ибо в тайпингах ошибка
        // Кинул фикс https://github.com/DefinitelyTyped/DefinitelyTyped/pull/51492
        const startTime = (params.startTime as unknown) as number
        const elapsedTime = Math.round((Date.now() - startTime) / 1000)
        const speed = params.value / elapsedTime
        payload.speed = ProgressHelper.bytesToSize(isFinite(speed) ? speed : 0)

        // Переопределение `скачано/всего`
        payload.value_formatted = ProgressHelper.bytesToSize(params.value)
        payload.total_formatted = ProgressHelper.bytesToSize(params.total)

        return Format.Formatter(
            { ...options, format: App.LangManager.getTranslate("ProgressHelper.download") },
            params,
            payload
        )
    }

    private static bytesToSize(bytes: number): string {
        const sizes = ["Bytes", "KB", "MB"]
        if (bytes === 0) return "0"
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        if (i === 0) return `${bytes} ${sizes[i]})`
        return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
    }
}
