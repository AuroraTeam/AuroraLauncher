export class SystemHelper {
    public static getPlatform(): NodeJS.Platform {
        return process.platform
    }

    // Функции isX кроме isStandalone добавлены, но пока не используются в коде
    // На будущее, если понадобится их использовать

    public static isWindows(): boolean {
        return process.platform === "win32"
    }

    public static isMac(): boolean {
        return process.platform === "darwin"
    }

    public static isLinux(): boolean {
        return process.platform === "linux"
    }

    /**
     * @returns true if this is a packaged version of the launcher
     */
    public static isStandalone(): boolean {
        return process.pkg !== undefined
    }
}
