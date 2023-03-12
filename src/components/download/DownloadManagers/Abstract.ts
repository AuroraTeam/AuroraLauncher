import { ConfigManager } from "@root/components/config"
import { LangManager } from "@root/components/langs"
import { ProfilesManager } from "@root/components/profiles"

export abstract class AbstractDownloadManager {
    constructor(
        protected langManager: LangManager,
        protected profilesManager: ProfilesManager,
        protected configManager: ConfigManager
    ) {}

    /**
     * Скачивание клиента
     * @param gameVersion - Версия игры
     * @param instanceName - Название сборки
     */
    abstract downloadClient(
        gameVersion: string,
        instanceName: string
    ): Promise<any>

    /**
     * Скачивание библиотек
     * @param gameVersion - Версия игры
     */
    abstract downloadLibraries(gameVersion: string): Promise<any>

    /**
     * Скачивание ассетов
     * @param gameVersion - Версия игры
     */
    abstract downloadAssets(gameVersion: string): Promise<any>
}
