export class SystemHelper {
    /**
     * Возвращает платформу текущего процесса NodeJS.
     * @returns Платформа, на которой выполняется код.
     */
    public static getPlatform(): NodeJS.Platform {
        return process.platform;
    }

    /**
     * Сравнивает платформы.
     */
    public static comparePlatforms(platform: AvailablePlatforms): boolean {
        return process.platform === platform;
    }

    /**
     * Проверяет, работает ли приложение в автономном (независимом) режиме.
     */
    public static isStandalone(): boolean {
        return process.pkg !== undefined;
    }
}

type AvailablePlatforms = "darwin" | "linux" | "win32";
