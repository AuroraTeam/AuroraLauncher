import * as cliProgress from "cli-progress"

export class ProgressBarHelper {
    static getProgressBar() {
        return new cliProgress.SingleBar({
            format: (options, params) => {
                // calculate barsize
                const completeSize = Math.round(params.progress * options.barsize)
                const incompleteSize = options.barsize - completeSize

                // generate bar string by stripping the pre-rendered strings
                const bar =
                    options.barCompleteString.substr(0, completeSize) +
                    options.barIncompleteString.substr(0, incompleteSize)

                function bytesToSize(bytes: number) {
                    const sizes = ["Bytes", "KB", "MB"]
                    if (bytes === 0) return "n/a"
                    const i = Math.floor(Math.log(bytes) / Math.log(1024))
                    if (i === 0) return `${bytes} ${sizes[i]})`
                    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
                }

                return `${bar} ${(params.progress * 100).toFixed(2)}% | Осталось: ${params.eta}s | ${bytesToSize(
                    params.value
                )}/${bytesToSize(params.total)}`
            },
            clearOnComplete: true,
            hideCursor: true,
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
        })
    }
}
