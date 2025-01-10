import {
    ClientsManager,
    CommandsManager,
    ConfigManager,
    FabricManager,
    ForgeManager,
    LangManager,
    MirrorManager,
    MojangManager,
    NeoForgeManager,
    ProfilesManager,
    QuiltManager,
} from "@root/components";
import { Watcher } from "@root/components/watcher/Watcher";
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
        private readonly watcher: Watcher,
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
        this.watcher.closeWatcher();
        await new DownloadManager(
            this.langManager,
            this.profilesManager,
            this.configManager,
        ).downloadClient(gameVersion, clientName);
        this.profilesManager.reloadProfiles();
        this.clientsManager.hashClients();
        this.commandsManager.console.resume();
        this.watcher.subscription();
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
            case "forge":
                return ForgeManager;
            case "neoforge":
                return NeoForgeManager;
            default:
                return null;
        }
    }
}
