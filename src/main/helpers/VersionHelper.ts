import { SemVer, valid } from "semver"

export enum VersionType {
    RELEASE = "release", // or STABLE?
    DEV = "dev",
    TESTING = "testing",
    LTS = "lts",
    // etc?
}

export class VersionHelper {
    static MAJOR: number = 0
    static MINOR: number = 0
    static PATCH: number = 1
    static TYPE: VersionType = VersionType.DEV

    /**
     * Получить обработанную версию лаунчсервера в виде строки
     * @returns `string`
     */
    static getVersion(): string {
        if (!this.TYPE) {
            return `${this.MAJOR}.${this.MINOR}.${this.PATCH}`
        } else {
            return `${this.MAJOR}.${this.MINOR}.${this.PATCH}-${this.TYPE}`
        }
    }

    /**
     * **Обёртка над `semver.valid`**
     *
     * Возвращает обработанную версию в виде строки или null, если она недействительна
     * @param version - Версия в виде строки или объекта SemVer
     * @returns `string` или `null`
     */
    static versionValidate(version: string | SemVer | null | undefined): string | null {
        return valid(version)
    }
}
