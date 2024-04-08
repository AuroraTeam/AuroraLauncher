import {
    CommandsManager,
    ConfigManager,
    FabricManager,
    LangManager,
    MirrorManager,
    MojangManager,
    ProfilesManager,
    ClientsManager,
    QuiltManager,
} from "@root/components";
import { AbstractCommand, Category, LogHelper } from "@root/utils";
import { Service } from "typedi";

@Service()
export class DownloadClientCommand extends AbstractCommand {
    constructor(
        private readonly langManager: LangManager,
        private readonly profilesManager: ProfilesManager,
        private readonly configManager: ConfigManager,
        private readonly commandsManager: CommandsManager,
        private readonly clientsManager: ClientsManager,
    ) {
        super({
            name: "downloadclient",
            description:
                langManager.getTranslate.CommandsManager.commands.updates.DownloadClientCommand,
            category: Category.UPDATES,
            usage: "<version> <client name> <?source type>",
        });
    }

    async invoke(gameVersion?: string, clientName?: string, sourceType = "mojang"): Promise<void> {
        if (!gameVersion) {
            return LogHelper.error("Укажите название/версию клиента!");
        }
        if (!clientName) {
            return LogHelper.error("Укажите название папки для клиента!");
        }

        const DownloadManager = this.getDownloadManager(sourceType);
        if (!DownloadManager) {
            return LogHelper.error(`Неизвестный тип источника: ${sourceType}`);
        }

        this.commandsManager.console.pause();
        await new DownloadManager(
            this.langManager,
            this.profilesManager,
            this.configManager,
        ).downloadClient(gameVersion, clientName);
        this.profilesManager.reloadProfiles();
        this.clientsManager.hashClients();
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
