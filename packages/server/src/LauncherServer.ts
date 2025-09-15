import { Container } from "@freshgum/typedi";

import { WebServerManager } from "./components/api/ApiManager";
import { IndexRequest, InjectorRequest } from "./components/api/requests";
import * as AuthLibRequests from "./components/api/requests/authlib";
import * as LauncherRequests from "./components/api/requests/launcher";
import { ArgsManager } from "./components/args";
import {
    AcceptAuthProvider,
    AuthManager,
    AuthProvider,
    JsonAuthProvider,
    RejectAuthProvider,
    YggdrasilAuthProvider,
} from "./components/auth";
import { ConfigManager } from "./components/config";
import { LangManager } from "./components/langs";
import { AuthProviderToken } from "./tokens";
import { LogHelper, StorageHelper } from "./utils";

export class LauncherServer /* extends EventEmitter */ {
    webServer: WebServerManager;
    authManager: AuthManager;

    private configManager: ConfigManager;
    private langManager: LangManager;
    private authProvider: AuthProvider;

    constructor() {
        // super();
        this.preInit();
        this.init();
        this.postInit();
    }

    private preInit() {
        // this.emit("preInit");

        LogHelper.printVersion();

        this.configManager = Container.get(ConfigManager);
        Container.get(ArgsManager);
        this.langManager = Container.get(LangManager);

        StorageHelper.validate();

        // this.emit("preInitDone");
    }

    private init() {
        // this.emit("init");

        this.registerAuthProviders();
        this.loadWebServer();
        // this.registerCommands();
        // Container.get(Watcher);

        // this.emit("initDone");
    }

    // private resolveDependencies() {
    // this._AuthlibManager = Container.get(AuthlibManager);
    // this._CommandsManager = Container.get(CommandsManager);
    // this._ClientsManager = Container.get(ClientsManager);
    // this._ProfilesManager = Container.get(ProfilesManager);
    // this._ModulesManager = new ModulesManager(this._LangManager, this); // Temporary
    // this._UpdateManager = Container.get(UpdateManager);
    // this.WebServerManager = new WebServerManager(this._ConfigManager, this._LangManager);
    // Container.set("WebServerManager", this.WebServerManager);
    // }

    private loadWebServer() {
        this.webServer = Container.get(WebServerManager);

        // internal
        this.webServer.registerRequest(Container.get(IndexRequest));
        this.webServer.registerRequest(Container.get(InjectorRequest));
        // mojang
        this.webServer.registerRequest(Container.get(AuthLibRequests.ProfilesRequest));
        this.webServer.registerRequest(Container.get(AuthLibRequests.JoinRequest));
        this.webServer.registerRequest(Container.get(AuthLibRequests.HasJoinedRequest));
        this.webServer.registerRequest(Container.get(AuthLibRequests.ProfileRequest));
        // launcher
        this.webServer.registerRequest(Container.get(LauncherRequests.LauncherRequest));
        this.webServer.registerRequest(Container.get(LauncherRequests.AuthTypeRequest));
        this.webServer.registerRequest(Container.get(LauncherRequests.AuthRequest));
        this.webServer.registerRequest(Container.get(LauncherRequests.ServersRequest));
        this.webServer.registerRequest(Container.get(LauncherRequests.ProfileRequest));
        this.webServer.registerRequest(Container.get(LauncherRequests.VerifyRequest));
        this.webServer.registerRequest(Container.get(LauncherRequests.UpdatesRequest));
    }

    private registerAuthProviders() {
        AuthManager.registerProviders({
            json: JsonAuthProvider,
            reject: RejectAuthProvider,
            accept: AcceptAuthProvider,
            yggdrasil: YggdrasilAuthProvider,
        });

        this.authProvider = AuthManager.getProvider(this.configManager, this.langManager);
        Container.set({ id: AuthProviderToken, value: this.authProvider, dependencies: [] });
    }

    // private registerCommands() {
    //     this._CommandsManager.registerCommands([
    //         Container.get(HelpCommand),
    //         Container.get(ModulesCommand),
    //         Container.get(BranchCommand),
    //         Container.get(UpdateCommand),
    //         Container.get(LangCommand),
    //         Container.get(SyncAllCommand),
    //         Container.get(SyncProfilesCommand),
    //         Container.get(SyncClientsCommand),
    //         Container.get(DownloadClientCommand),
    //         Container.get(AboutCommand),
    //         Container.get(StopCommand),
    //     ]);
    // }

    private postInit() {
        // this.emit("postInit");

        this.webServer.start();

        // this.emit("postInitDone");
    }
}
