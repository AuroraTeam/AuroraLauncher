import {
    CommandsManager,
    ConfigManager,
    LangManager,
    MirrorManager,
    MojangManager,
    ProfilesManager,
} from "@root/components";
import { AbstractCommand, Category, LogHelper } from "@root/utils";
import { injectable } from "tsyringe";

@injectable()
export class DownloadAssetsCommand extends AbstractCommand {
    constructor(
        private readonly langManager: LangManager,
        private readonly profilesManager: ProfilesManager,
        private readonly configManager: ConfigManager,
        private readonly commandsManager: CommandsManager
    ) {
        super({
            name: "downloadassets",
            description:
                langManager.getTranslate.CommandsManager.commands.updates
                    .DownloadAssetsCommand,
            category: Category.UPDATES,
            usage: "<version> <?source type>",
        });
    }

    async invoke(gameVersion?: string, sourceType = "mojang"): Promise<void> {
        if (!gameVersion) return LogHelper.error("Укажите версию ассетов!");

        const DownloadManager = this.getDownloadManager(sourceType);
        if (!DownloadManager) {
            return LogHelper.error(`Неизвестный тип источника: ${sourceType}`);
        }

        this.commandsManager.console.pause();
        await new DownloadManager(
            this.langManager,
            this.profilesManager,
            this.configManager
        ).downloadAssets(gameVersion);
        this.commandsManager.console.resume();
    }

    private getDownloadManager(sourceType: string) {
        switch (sourceType) {
            case "mirror":
                return MirrorManager;
            case "mojang":
                return MojangManager;
            default:
                return null;
        }
    }
}
