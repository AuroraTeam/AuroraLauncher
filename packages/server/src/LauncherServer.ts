import Container, { Service } from "typedi";

import {
    AboutCommand,
    AcceptAuthProvider,
    AuthManager,
    AuthProvider,
    AuthWsRequest,
    AuthlibManager,
    BranchCommand,
    ClientsManager,
    CommandsManager,
    ConfigManager,
    DatabaseAuthProvider,
    DownloadClientCommand,
    HasJoinedWebRequest,
    HelpCommand,
    InjectorWebRequest,
    JoinWebRequest,
    JsonAuthProvider,
    LangCommand,
    LangManager,
    ModulesCommand,
    ModulesManager,
    ProfileWebRequest,
    ProfileWsRequest,
    ProfilesManager,
    RejectAuthProvider,
    ServersWsRequest,
    StopCommand,
    SyncAllCommand,
    SyncClientsCommand,
    SyncProfilesCommand,
    UpdateCommand,
    UpdateManager,
    UpdatesWsRequest,
    WebManager,
} from "./components";
import { VerifyWsRequest } from "./components/api/websocket/requests/VerifyRequest";
import { LogHelper, StorageHelper } from "./utils";

@Service()
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

        this._ConfigManager = Container.get(ConfigManager);
        this._LangManager = Container.get(LangManager);

        StorageHelper.validate();
    }

    private init() {
        this.registerAuthProviders();
        this.resolveDependencies();
        this.registerCommands();
        this.registerRequest();
    }

    private resolveDependencies() {
        this._AuthlibManager = Container.get(AuthlibManager);
        this._CommandsManager = Container.get(CommandsManager);
        this._ClientsManager = Container.get(ClientsManager);
        this._ProfilesManager = Container.get(ProfilesManager);
        this._ModulesManager = new ModulesManager(this._LangManager, this); // Temporary
        this._UpdateManager = Container.get(UpdateManager);
        this._WebManager = Container.get(WebManager);
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

    private registerRequest() {
        this._WebManager.registerWsRequests([
            Container.get(AuthWsRequest),
            Container.get(ProfileWsRequest),
            Container.get(ServersWsRequest),
            Container.get(UpdatesWsRequest),
            Container.get(VerifyWsRequest),
        ]);

        this._WebManager.registerWebRequests([
            Container.get(InjectorWebRequest),
            Container.get(ProfileWebRequest),
            Container.get(ProfileWebRequest),
            Container.get(JoinWebRequest),
            Container.get(HasJoinedWebRequest),
        ]);
    }
}
