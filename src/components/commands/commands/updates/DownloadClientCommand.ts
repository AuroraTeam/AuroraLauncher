import {
    CommandsManager,
    ConfigManager,
    FabricManager,
    LangManager,
    MirrorManager,
    MojangManager,
    ProfilesManager,
    QuiltManager,
} from "@root/components/";
import { AbstractCommand, Category, LogHelper } from "@root/utils";
import { injectable } from "tsyringe";

@injectable()
export class DownloadClientCommand extends AbstractCommand {
    constructor(
        private readonly langManager: LangManager,
        private readonly profilesManager: ProfilesManager,
        private readonly configManager: ConfigManager,
        private readonly commandsManager: CommandsManager
    ) {
        super({
            name: "downloadclient",
            description:
                langManager.getTranslate.CommandsManager.commands.updates
                    .DownloadClientCommand,
            category: Category.UPDATES,
            usage: "<version> <instance name> <?source type>",
        });
    }

    async invoke(
        gameVersion?: string,
        instanceName?: string,
        sourceType = "mojang"
    ): Promise<void> {
        if (!gameVersion) {
            return LogHelper.error("Укажите название/версию клиента!");
        }
        if (!instanceName) {
            return LogHelper.error("Укажите название папки для инстанции!");
        }

        const DownloadManager = this.getDownloadManager(sourceType);
        if (!DownloadManager) {
            return LogHelper.error(`Неизвестный тип источника: ${sourceType}`);
        }

        this.commandsManager.console.pause();
        await new DownloadManager(
            this.langManager,
            this.profilesManager,
            this.configManager
        ).downloadClient(gameVersion, instanceName);
        this.commandsManager.console.resume();
    }

    private getDownloadManager(sourceType: string) {
        switch (sourceType) {
            case "mirror":
                return MirrorManager;
            case "fabric":
                return FabricManager;
            case "mojang":
                return MojangManager;
            case "quilt":
                return QuiltManager;
            default:
                return null;
        }
    }
}
