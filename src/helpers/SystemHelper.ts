export class SystemHelper {
    public static getPlatform(): NodeJS.Platform {
        return process.platform
    }

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
     * @returns true если это упакованная версия лаунчера
     */
    public static isStandalone(): boolean {
        return process.pkg !== undefined
    }
}
