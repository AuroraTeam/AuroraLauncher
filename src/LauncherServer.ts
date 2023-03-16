import { container, singleton } from "tsyringe";

import {
    AuthManager,
    AuthlibManager,
    ClientsManager,
    CommandsManager,
    ConfigManager,
    LangManager,
    ModulesManager,
    ProfilesManager,
    UpdateManager,
    WebManager,
} from "./components";
import {
    AcceptAuthProvider,
    AuthProvider,
    DatabaseAuthProvider,
    JsonAuthProvider,
    MojangAuthProvider,
    RejectAuthProvider,
} from "./components/auth/providers";
import {
    AboutCommand,
    BranchCommand,
    DownloadClientCommand,
    HelpCommand,
    LangCommand,
    ModulesCommand,
    ReloadCommand,
    StopCommand,
    SyncAllCommand,
    SyncInstancesCommand,
    SyncProfilesCommand,
    UpdateCommand,
} from "./components/commands/commands";
import { LogHelper, StorageHelper } from "./utils";

@singleton()
export class LauncherServer {
    private _AuthProvider: AuthProvider;
    public get AuthProvider(): AuthProvider {
        return this._AuthProvider;
    }

    private _ConfigManager: ConfigManager;
    private _LangManager: LangManager;
    private _CommandsManager: CommandsManager;
    private _ModulesManager: ModulesManager;
    private _WebManager: WebManager;
    private _ClientsManager: ClientsManager;
    private _UpdateManager: UpdateManager;
    private _ProfilesManager: ProfilesManager;
    private _AuthlibManager: AuthlibManager;

    /**
     * It initializes the LauncherServer.
     */
    constructor() {
        StorageHelper.validate();

        LogHelper.printVersion();

        LogHelper.info("Initialization start");
        this.init();

        LogHelper.info(this._LangManager.getTranslate.LauncherServer.initEnd);
    }

    private init() {
        this._ConfigManager = container.resolve(ConfigManager);
        this._LangManager = container.resolve(LangManager);

        // Auth
        AuthManager.registerProviders({
            json: JsonAuthProvider,
            db: DatabaseAuthProvider,
            mojang: MojangAuthProvider,
            reject: RejectAuthProvider,
            accept: AcceptAuthProvider,
        });

        this._AuthProvider = AuthManager.getProvider(
            this._ConfigManager,
            this._LangManager
        );
        container.register("AuthProvider", { useValue: this._AuthProvider });

        // Other

        this._AuthlibManager = container.resolve(AuthlibManager);

        this._CommandsManager = container.resolve(CommandsManager);
        this._CommandsManager.registerCommands([
            container.resolve(HelpCommand),
            container.resolve(ReloadCommand),
            container.resolve(ModulesCommand),
            container.resolve(BranchCommand),
            container.resolve(UpdateCommand),
            container.resolve(LangCommand),
            container.resolve(SyncAllCommand),
            container.resolve(SyncProfilesCommand),
            container.resolve(SyncInstancesCommand),
            container.resolve(DownloadClientCommand),
            container.resolve(AboutCommand),
            container.resolve(StopCommand),
        ]);

        this._ClientsManager = container.resolve(ClientsManager);
        this._ProfilesManager = container.resolve(ProfilesManager);
        this._ModulesManager = container.resolve(ModulesManager);
        this._UpdateManager = container.resolve(UpdateManager);
        this._WebManager = container.resolve(WebManager);
    }

    /**
     * It reload the LauncherServer.
     */
    public reload() {
        LogHelper.info("Reload LaunchServer");
        container.clearInstances();
        this.init();
    }
}
