import { Container, Service } from "@freshgum/typedi";

import { WebServerManager } from "./components/api/webserver";
import { IndexWebRequest } from "./components/api/webserver/requests/IndexRequest";
import { InjectorWebRequest } from "./components/api/webserver/requests/InjectorRequest";
import { ArgsManager } from "./components/args";
import { ConfigManager } from "./components/config";
import { LangManager } from "./components/langs";
import { LogHelper, StorageHelper } from "./utils";

@Service([])
export class LauncherServer /* extends EventEmitter */ {
    webServer: WebServerManager;

    constructor() {
        // super();
        this.preInit();
        this.init();
        this.postInit();
    }

    private preInit() {
        // this.emit("preInit");

        LogHelper.printVersion();

        Container.get(ConfigManager);
        Container.get(ArgsManager);
        Container.get(LangManager);

        StorageHelper.validate();

        // this.emit("preInitDone");
    }

    private init() {
        // this.emit("init");

        // this.registerAuthProviders();
        this.#loadWebServer();
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

    #loadWebServer() {
        this.webServer = Container.get(WebServerManager);

        this.webServer.registerRequest(Container.get(IndexWebRequest));
        this.webServer.registerRequest(Container.get(InjectorWebRequest));
    }

    // private registerAuthProviders() {
    //     AuthManager.registerProviders({
    //         json: JsonAuthProvider,
    //         reject: RejectAuthProvider,
    //         accept: AcceptAuthProvider,
    //         yggdrasil: YggdrasilAuthProvider,
    //     });

    //     this._AuthProvider = AuthManager.getProvider(this._ConfigManager, this._LangManager);
    //     Container.set("AuthProvider", this._AuthProvider);
    // }

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
