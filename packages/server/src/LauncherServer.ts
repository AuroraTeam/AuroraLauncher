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
import { ClientsManager } from "./components/clients/ClientsManager";
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
import { ProfilesManager } from "./components/profiles/ProfilesManager";
import { UpdateManager } from "./components/update/UpdateManager";
import { Watcher } from "./components/watcher/Watcher";
import { LogHelper } from "./helpers";
import { AuthProviderToken } from "./tokens";

export class LauncherServer {
    webServer!: WebServerManager;
    authManager!: AuthManager;

    private configManager!: ConfigManager;
    private langManager!: LangManager;
    private commandsManager!: CommandsManager;
    private authProvider!: AuthProvider;
    private watcher?: Watcher;
    private startPromise?: Promise<void>;

    start(): Promise<void> {
        return (this.startPromise ??= this.initialize());
    }

    private async initialize(): Promise<void> {
        try {
            this.preInit();
            await this.init();
            await this.postInit();
        } catch (error) {
            await this.stop();
            throw error;
        }
    }

    private preInit() {
        LogHelper.printVersion();

        this.configManager = Container.get(ConfigManager);
        Container.get(ArgsManager);
        this.langManager = Container.get(LangManager);
    }

    private async init(): Promise<void> {
        this.registerAuthProviders();
        await Container.get(ProfilesManager).init();
        await Container.get(ClientsManager).init();

        this.webServer = Container.get(WebServerManager);
        await this.webServer.init();

        this.registerCommands();
        this.registerRequests();
    }

    private registerRequests() {
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

    private async postInit(): Promise<void> {
        await this.webServer.start();
        this.watcher = Container.get(Watcher);
        await this.watcher.subscription();
        this.commandsManager.start();

        // Checking for updates is optional and must not delay server readiness.
        void Container.get(UpdateManager)
            .checkUpdate()
            .catch((error: unknown) => LogHelper.error(error));
    }

    async stop(): Promise<void> {
        this.commandsManager?.stop();
        const results = await Promise.allSettled([
            this.watcher?.closeWatcher(),
            this.webServer?.stop(),
        ]);
        for (const result of results) {
            if (result.status === "rejected") LogHelper.error(result.reason);
        }
    }
}
