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
    AuthRequest,
    ProfileRequest,
    ServersRequest,
    UpdatesRequest,
} from "./components/api/websocket/requests";
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
    SyncClientsCommand,
    SyncProfilesCommand,
    UpdateCommand,
} from "./components/commands/commands";
import { LogHelper, StorageHelper } from "./utils";

@singleton()
export class LauncherServer {
    private _AuthProvider: AuthProvider;
    private _ConfigManager: ConfigManager;
    private _LangManager: LangManager;
    private _CommandsManager: CommandsManager;
    private _ModulesManager: ModulesManager;
    private _WebManager: WebManager;
    private _ClientsManager: ClientsManager;
    private _UpdateManager: UpdateManager;
    private _ProfilesManager: ProfilesManager;
    private _AuthlibManager: AuthlibManager;

    constructor() {
        this.preInit();
        this.init();
    }

    private preInit() {
        LogHelper.printVersion();

        this._ConfigManager = container.resolve(ConfigManager);
        this._LangManager = container.resolve(LangManager);

        StorageHelper.validate();
    }

    private init() {
        LogHelper.info(this._LangManager.getTranslate.LauncherServer.initStart);

        this.registerAuthProviders();
        this.resolveDependencies();
        this.registerCommands();
        this.registerRequest();

        LogHelper.info(this._LangManager.getTranslate.LauncherServer.initEnd);
    }

    private resolveDependencies() {
        this._AuthlibManager = container.resolve(AuthlibManager);
        this._CommandsManager = container.resolve(CommandsManager);
        this._ClientsManager = container.resolve(ClientsManager);
        this._ProfilesManager = container.resolve(ProfilesManager);
        this._ModulesManager = container.resolve(ModulesManager);
        this._UpdateManager = container.resolve(UpdateManager);
        this._WebManager = container.resolve(WebManager);
    }

    private registerAuthProviders() {
        AuthManager.registerProviders({
            json: JsonAuthProvider,
            db: DatabaseAuthProvider,
            mojang: MojangAuthProvider,
            reject: RejectAuthProvider,
            accept: AcceptAuthProvider,
        });

        this._AuthProvider = AuthManager.getProvider(this._ConfigManager, this._LangManager);
        container.register("AuthProvider", { useValue: this._AuthProvider });
    }

    private registerCommands() {
        this._CommandsManager.registerCommands([
            container.resolve(HelpCommand),
            container.resolve(ReloadCommand),
            container.resolve(ModulesCommand),
            container.resolve(BranchCommand),
            container.resolve(UpdateCommand),
            container.resolve(LangCommand),
            container.resolve(SyncAllCommand),
            container.resolve(SyncProfilesCommand),
            container.resolve(SyncClientsCommand),
            container.resolve(DownloadClientCommand),
            container.resolve(AboutCommand),
            container.resolve(StopCommand),
        ]);
    }

    private registerRequest() {
        this._WebManager.registerRequests([
            container.resolve(AuthRequest),
            container.resolve(ProfileRequest),
            container.resolve(ServersRequest),
            container.resolve(UpdatesRequest),
        ]);
    }

    /**
     * Функция для перезагрузки LauncherSever'а
     */
    public reload() {
        LogHelper.info("Reload LaunchServer");
        container.clearInstances();
        this.init();
    }
}
