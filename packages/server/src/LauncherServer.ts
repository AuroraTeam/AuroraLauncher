import Container, { Service } from "typedi";

import {
    AboutCommand,
    AcceptAuthProvider,
    ArgsManager,
    AuthManager,
    AuthProvider,
    AuthlibManager,
    BranchCommand,
    ClientsManager,
    CommandsManager,
    ConfigManager,
    DatabaseAuthProvider,
    DownloadClientCommand,
    HelpCommand,
    JsonAuthProvider,
    LangCommand,
    LangManager,
    ModulesCommand,
    ModulesManager,
    ProfilesManager,
    RejectAuthProvider,
    StopCommand,
    SyncAllCommand,
    SyncClientsCommand,
    SyncProfilesCommand,
    UpdateCommand,
    UpdateManager,
    GrpcServerManager,
    Watcher,
    WebServerManager,
} from "./components";
import { LogHelper, StorageHelper } from "./utils";

@Service()
export class LauncherServer {
    private _AuthProvider: AuthProvider;
    private _ConfigManager: ConfigManager;
    private _LangManager: LangManager;
    private _CommandsManager: CommandsManager;
    private _ModulesManager: ModulesManager;
    private _GrpcServerManager: GrpcServerManager;
    private _ClientsManager: ClientsManager;
    private _UpdateManager: UpdateManager;
    private _ProfilesManager: ProfilesManager;
    private _AuthlibManager: AuthlibManager;
    private _ArgsManager: ArgsManager;
    private _Watcher: Watcher;
    private _WebServerManager: WebServerManager;

    constructor() {
        this.preInit();
        this.init();
    }

    private preInit() {
        LogHelper.printVersion();

        this._ConfigManager = Container.get(ConfigManager);
        this._ArgsManager = Container.get(ArgsManager);
        this._LangManager = Container.get(LangManager);

        StorageHelper.validate();
    }

    private init() {
        this.registerAuthProviders();
        this.resolveDependencies();
        this.registerCommands();
        this._Watcher = Container.get(Watcher);
    }

    private resolveDependencies() {
        this._AuthlibManager = Container.get(AuthlibManager);
        this._CommandsManager = Container.get(CommandsManager);
        this._ClientsManager = Container.get(ClientsManager);
        this._ProfilesManager = Container.get(ProfilesManager);
        this._ModulesManager = new ModulesManager(this._LangManager, this); // Temporary
        this._UpdateManager = Container.get(UpdateManager);
        this._GrpcServerManager = Container.get(GrpcServerManager);
        this._WebServerManager = Container.get(WebServerManager);
    }

    private registerAuthProviders() {
        AuthManager.registerProviders({
            json: JsonAuthProvider,
            db: DatabaseAuthProvider,
            reject: RejectAuthProvider,
            accept: AcceptAuthProvider,
        });

        this._AuthProvider = AuthManager.getProvider(this._ConfigManager, this._LangManager);
        Container.set("AuthProvider", this._AuthProvider);
    }

    private registerCommands() {
        this._CommandsManager.registerCommands([
            Container.get(HelpCommand),
            Container.get(ModulesCommand),
            Container.get(BranchCommand),
            Container.get(UpdateCommand),
            Container.get(LangCommand),
            Container.get(SyncAllCommand),
            Container.get(SyncProfilesCommand),
            Container.get(SyncClientsCommand),
            Container.get(DownloadClientCommand),
            Container.get(AboutCommand),
            Container.get(StopCommand),
        ]);
    }
}
