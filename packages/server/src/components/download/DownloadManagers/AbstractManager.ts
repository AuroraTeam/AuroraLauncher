import { ConfigManager } from "@root/components/config/ConfigManager";
import { LangManager } from "@root/components/langs/LangManager";
import { ProfilesManager } from "@root/components/profiles/ProfilesManager";

export abstract class AbstractDownloadManager {
    constructor(
        protected langManager: LangManager,
        protected profilesManager: ProfilesManager,
        protected configManager: ConfigManager,
    ) {}

    /**
     * Скачивание клиента
     * @param gameVersion - Версия игры
     * @param clientName - Название сборки
     */
    public abstract downloadClient(gameVersion: string, clientName: string): Promise<any>;

    protected getLibPath(name: string): string {
        const patterns = name.split(":");
        return `${patterns[0]?.replace(/\./g, "/")}/${patterns[1]}/${patterns[2]}/${patterns[1]}-${
            patterns[2]
        }.jar`;
    }
}
