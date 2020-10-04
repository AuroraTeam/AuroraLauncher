import * as progress from "progress-stream"

import { App } from "../LauncherServer"

export class ProgressHelper {
    static barCompleteChar = "\u2588"
    static barIncompleteChar = "\u2591"
    static barsize = 20

    static getLoadingProgressBar(options?: progress.Options): progress.ProgressStream {
        return this.getProgress(options, ProgressType.LOADING)
    }

    static getDownloadProgressBar(options: progress.Options): progress.ProgressStream {
        return this.getProgress(options, ProgressType.DOWNLOAD)
    }

    private static getProgress(options: progress.Options, type: ProgressType): progress.ProgressStream {
        const info = progress(options)
        process.stdout.write("\x1B[?25l") // Hide cursor
        info.on("progress", (progress) => {
            process.stdout.clearLine(0)
            process.stdout.cursorTo(0)
            switch (type) {
                case ProgressType.LOADING:
                    process.stdout.write(this.getLoadingProgressTemplate(progress))
                    break
                case ProgressType.DOWNLOAD:
                    process.stdout.write(this.getDownloadProgressTemplate(progress))
                    break
            }
        })
        info.on("end", () => {
            process.stdout.clearLine(0)
            process.stdout.cursorTo(0)
            process.stdout.write("\x1B[?25h") // Show cursor
        })
        return info
    }

    private static getLoadingProgressTemplate(progress: progress.Progress) {
        return App.LangManager.getTranslate("ProgressHelper.loading")
            .replace("{bar}", this.getBar(progress.percentage, this.barsize * 2))
            .replace("{percent}", progress.percentage.toFixed(2))
    }

    private static getDownloadProgressTemplate(progress: progress.Progress) {
        return App.LangManager.getTranslate("ProgressHelper.download")
            .replace("{bar}", this.getBar(progress.percentage))
            .replace("{percent}", progress.percentage.toFixed(2))
            .replace("{eta}", progress.eta.toString())
            .replace("{speed}", this.bytesToSize(progress.speed))
            .replace("{transferred}", this.bytesToSize(progress.transferred))
            .replace("{total}", this.bytesToSize(progress.length))
    }

    private static getBar(percentage: number, size = 0): string {
        // calculate barsize
        const barsize = size !== 0 ? size : this.barsize
        const completeSize = Math.round((percentage / 100) * barsize)
        const incompleteSize = barsize - completeSize

        // generate bar string by stripping the pre-rendered strings
        return this.barCompleteChar.repeat(completeSize) + this.barIncompleteChar.repeat(incompleteSize)
    }

    private static bytesToSize(bytes: number): string {
        const sizes = ["Bytes", "KB", "MB"]
        if (bytes === 0) return "n/a"
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        if (i === 0) return `${bytes} ${sizes[i]})`
        return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
    }
}

export enum ProgressType {
    DOWNLOAD,
    LOADING,
}
