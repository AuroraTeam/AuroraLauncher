import { Container } from "@freshgum/typedi";

import { WebServerManager } from "./components/api/ApiManager";
import { ProfilesRequest } from "./components/api/requests/authlib/api/ProfilesRequest";
import { AuthenticateRequest } from "./components/api/requests/authlib/authserver/AuthRequest";
import { InvalidateRequest } from "./components/api/requests/authlib/authserver/InvalidateRequest";
import { RefreshRequest } from "./components/api/requests/authlib/authserver/RefreshRequest";
import { ValidateRequest } from "./components/api/requests/authlib/authserver/ValidateRequest";
import { HasJoinedRequest } from "./components/api/requests/authlib/sessionserver/HasJoinedRequest";
import { JoinRequest } from "./components/api/requests/authlib/sessionserver/JoinRequest";
import { ProfileRequest as AuthlibProfileRequest } from "./components/api/requests/authlib/sessionserver/ProfileRequest";
import { IndexRequest } from "./components/api/requests/IndexRequest";
import { InjectorRequest } from "./components/api/requests/InjectorRequest";
import { LauncherRequest } from "./components/api/requests/launcher/LauncherRequest";
import { ProfileRequest } from "./components/api/requests/launcher/ProfileRequest";
import { ServersRequest } from "./components/api/requests/launcher/ServersRequest";
import { UpdatesRequest } from "./components/api/requests/launcher/UpdatesRequest";
import { VerifyRequest } from "./components/api/requests/launcher/VerifyRequest";
import { DownloadReleaseRequest } from "./components/api/requests/release-server/DownloadReleaseRequest";
import { GetTokenRequest } from "./components/api/requests/release-server/GetTokenRequest";
import { ArgsManager } from "./components/args/ArgsManager";
import { AuthManager } from "./components/auth/AuthManager";
import { AcceptAuthProvider } from "./components/auth/providers/AcceptAuthProvider";
import { AuthProvider } from "./components/auth/providers/AuthProvider";
import { JsonAuthProvider } from "./components/auth/providers/JsonAuthProvider";
import { RejectAuthProvider } from "./components/auth/providers/RejectAuthProvider";
import { YggdrasilAuthProvider } from "./components/auth/providers/YggdrasilAuthProvider";
import { AboutCommand } from "./components/commands/commands/basic/AboutCommand";
import { HelpCommand } from "./components/commands/commands/basic/HelpCommand";
import { LangCommand } from "./components/commands/commands/basic/LangCommand";
import { ModulesCommand } from "./components/commands/commands/basic/ModulesCommand";
import { StopCommand } from "./components/commands/commands/basic/StopCommand";
import { UpdateCommand } from "./components/commands/commands/basic/UpdateCommand";
import { DownloadClientCommand } from "./components/commands/commands/updates/DownloadClientCommand";
import { SyncAllCommand } from "./components/commands/commands/updates/SyncAllCommand";
import { SyncClientsCommand } from "./components/commands/commands/updates/SyncClientsCommand";
import { SyncProfilesCommand } from "./components/commands/commands/updates/SyncProfilesCommand";
import { CommandsManager } from "./components/commands/CommandsManager";
import { ConfigManager } from "./components/config/ConfigManager";
import { LangManager } from "./components/langs/LangManager";
import { LogHelper } from "./helpers";
import { AuthProviderToken } from "./tokens";

export class LauncherServer /* extends EventEmitter */ {
    webServer!: WebServerManager;
    authManager!: AuthManager;

    private configManager!: ConfigManager;
    private langManager!: LangManager;
    private commandsManager!: CommandsManager;
    private authProvider!: AuthProvider;

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

        // this.emit("preInitDone");
    }

    private init() {
        // this.emit("init");

        this.registerAuthProviders();
        this.registerCommands();
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
        // authlib (authserver)
        this.webServer.registerRequest(Container.get(AuthenticateRequest));
        this.webServer.registerRequest(Container.get(RefreshRequest));
        this.webServer.registerRequest(Container.get(ValidateRequest));
        this.webServer.registerRequest(Container.get(InvalidateRequest));
        // authlib (api)
        this.webServer.registerRequest(Container.get(ProfilesRequest));
        // authlib (sessionserver)
        this.webServer.registerRequest(Container.get(JoinRequest));
        this.webServer.registerRequest(Container.get(HasJoinedRequest));
        this.webServer.registerRequest(Container.get(AuthlibProfileRequest));
        // launcher
        this.webServer.registerRequest(Container.get(LauncherRequest));
        this.webServer.registerRequest(Container.get(ServersRequest));
        this.webServer.registerRequest(Container.get(ProfileRequest));
        this.webServer.registerRequest(Container.get(VerifyRequest));
        this.webServer.registerRequest(Container.get(UpdatesRequest));
        // release-server
        this.webServer.registerRequest(Container.get(GetTokenRequest));
        this.webServer.registerRequest(Container.get(DownloadReleaseRequest));
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

    private registerCommands() {
        this.commandsManager = Container.get(CommandsManager);

        this.commandsManager.registerCommands([
            Container.get(HelpCommand),
            Container.get(ModulesCommand),
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

    private postInit() {
        // this.emit("postInit");

        this.loadWebServer();
        this.webServer.start();

        // this.emit("postInitDone");
    }
}
