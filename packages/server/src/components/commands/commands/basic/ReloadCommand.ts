import { LauncherServer } from "@root/LauncherServer";
import { AbstractCommand, Category, LogHelper } from "@root/utils";
import { Inject, Service } from "typedi";

@Service()
export class ReloadCommand extends AbstractCommand {
    @Inject(() => LauncherServer)
    private readonly launcherServer: LauncherServer;

    constructor() {
        super({
            name: "reload",
            description: "Restarts LauncherServer",
            category: Category.BASIC,
        });
    }

    invoke(): void {
        LogHelper.info("LauncherServer restarts...");
        this.launcherServer.reload();
    }
}
