import { Format, GenericFormatter, MultiBar, Options, Params, SingleBar } from "cli-progress";

export class ProgressHelper {
    private static barCompleteChar = "\u2588";
    private static barIncompleteChar = "\u2591";
    private static barsize = 20;

    public static getLoadingProgressBar(): SingleBar {
        return this.getProgress("{bar} {percentage}%", this.barsize * 2);
    }

    public static getDownloadProgressBar(): SingleBar {
        return this.getProgress(this.downloadFormatter);
    }

    public static getDownloadMultiProgressBar(): MultiBar {
        return this.getMultiProgress(this.downloadFormatter);
    }

    public static getProgress(
        format: string | GenericFormatter,
        barsize = this.barsize,
    ): SingleBar {
        return new SingleBar(this.getDefaultParams(format, barsize));
    }

    private static getMultiProgress(format: string | GenericFormatter): MultiBar {
        return new MultiBar(this.getDefaultParams(format));
    }

    private static getDefaultParams(
        format: string | GenericFormatter,
        barsize = this.barsize,
    ): Options {
        return {
            format,
            barCompleteChar: this.barCompleteChar,
            barIncompleteChar: this.barIncompleteChar,
            barsize,
            hideCursor: true,
            clearOnComplete: true,
            stopOnComplete: true,
            autopadding: true,
            emptyOnZero: true,
            forceRedraw: true,
        };
    }

    private static downloadFormatter(
        options: Options,
        params: Params,
        payload: {
            speed: string;
            value_formatted: string;
            total_formatted: string;
        },
    ) {
        const elapsedTime = Math.round((Date.now() - params.startTime) / 1000);
        const speed = params.value / elapsedTime;
        payload.speed = ProgressHelper.bytesToSize(isFinite(speed) ? speed : 0);

        // Переопределение `скачано/всего`
        payload.value_formatted = ProgressHelper.bytesToSize(params.value);
        payload.total_formatted = ProgressHelper.bytesToSize(params.total);

        return Format.Formatter(
            {
                ...options,
                format: "{bar} {percentage}% | Осталось: {eta_formatted} | Скорость: {speed}/s | {value_formatted}/{total_formatted} | {filename}",
            },
            params,
            payload,
        );
    }

    private static bytesToSize(bytes: number): string {
        const sizes = ["Bytes", "KB", "MB"];
        if (bytes === 0) return "0";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        if (i === 0) return `${bytes} ${sizes[i]}`;
        return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
    }
}
