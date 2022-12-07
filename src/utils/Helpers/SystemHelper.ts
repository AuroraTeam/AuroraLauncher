export class SystemHelper {
    /**
     * It returns the platform of the current NodeJS process.
     * @returns The platform that the code is running on.
     */
    public static getPlatform(): NodeJS.Platform {
        return process.platform
    }

    /**
     * Compares platforms
     * @returns The return value is a boolean.
     */
    public static comparePlatforms(platform: availablePlatforms): boolean {
        return process.platform === platform
    }

    /**
     * It checks if the application is running in a standalone mode.
     * @returns The return value is a boolean.
     */
    public static isStandalone(): boolean {
        return process.pkg !== undefined
    }
}

type availablePlatforms = "darwin" | "linux" | "win32"
