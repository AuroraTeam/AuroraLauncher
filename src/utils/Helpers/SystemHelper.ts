export class SystemHelper {
    /**
     * It returns the platform of the current NodeJS process.
     * @returns The platform that the code is running on.
     */
    public static getPlatform(): NodeJS.Platform {
        return process.platform
    }

    /**
     * It returns true if the current operating system is Windows
     * @returns The platform that the code is running on.
     */
    public static isWindows(): boolean {
        return process.platform === "win32"
    }

   /**
    * It returns true if the platform is Mac.
    * @returns The platform that the application is running on.
    */
    public static isMac(): boolean {
        return process.platform === "darwin"
    }

    /**
     * It returns true if the platform is Linux.
     * @returns The platform of the operating system.
     */
    public static isLinux(): boolean {
        return process.platform === "linux"
    }

    /**
     * It checks if the application is running in a standalone mode.
     * @returns The return value is a boolean.
     */
    public static isStandalone(): boolean {
        return process.pkg !== undefined
    }
}
