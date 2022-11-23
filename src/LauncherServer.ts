import chalk from "chalk"
import { container, singleton } from "tsyringe"

import { version } from "../package.json"
import {
    AuthManager,
    AuthlibManager,
    CommandsManager,
    ConfigManager,
    InstancesManager,
    LangManager,
    ModulesManager,
    ProfilesManager,
    UpdateManager,
    WebManager,
} from "./components"
import { AbstractAuthProvider } from "./components/auth/authProviders/AbstractAuthProvider"
import { LogHelper, StorageHelper } from "./utils"

@singleton()
export class LauncherServer {
    private _AuthProvider: AbstractAuthProvider
    public get AuthProvider(): AbstractAuthProvider {
        return this._AuthProvider
    }

    private _ConfigManager: ConfigManager
    private _LangManager: LangManager
    private _AuthManager: AuthManager
    private _CommandsManager: CommandsManager
    private _ModulesManager: ModulesManager
    private _WebManager: WebManager
    private _InstancesManager: InstancesManager
    private _UpdateManager: UpdateManager
    private _ProfilesManager: ProfilesManager
    private _AuthlibManager: AuthlibManager

    /**
     * It initializes the LauncherServer.
     */
    constructor() {
        StorageHelper.validate()
        this.printVersion()

        LogHelper.info("Initialization start")
        this.initialize()

        LogHelper.info(this._LangManager.getTranslate.LauncherServer.initEnd)
    }

    private initialize() {
        this._ConfigManager = container.resolve(ConfigManager)
        this._LangManager = container.resolve(LangManager)

        // Auth
        AuthManager.registerProviders()
        this._AuthManager = container.resolve(AuthManager)
        this._AuthProvider = this._AuthManager.getAuthProvider()
        // this._AuthProvider = AuthManager.getProvider()

        this._AuthlibManager = container.resolve(AuthlibManager)
        this._CommandsManager = container.resolve(CommandsManager)
        this._InstancesManager = container.resolve(InstancesManager)
        this._ProfilesManager = container.resolve(ProfilesManager)
        this._ModulesManager = container.resolve(ModulesManager)
        this._UpdateManager = container.resolve(UpdateManager)
    }

    /**
     * It reload the LauncherServer.
     */
    public reload() {
        LogHelper.info("Reload LaunchServer")
        container.clearInstances()
        this.initialize()
    }

    /**
     * @deprecated use dependency injection instead
     */
    get ConfigManager(): ConfigManager {
        return this._ConfigManager
    }

    /**
     * @deprecated use dependency injection instead
     */
    get LangManager(): LangManager {
        return this._LangManager
    }

    /**
     * @deprecated use dependency injection instead
     */
    get AuthManager(): AuthManager {
        return this._AuthManager
    }

    /**
     * @deprecated use dependency injection instead
     */
    get CommandsManager(): CommandsManager {
        return this._CommandsManager
    }

    /**
     * @deprecated use dependency injection instead
     */
    get ModulesManager(): ModulesManager {
        return this._ModulesManager
    }

    /**
     * @deprecated use dependency injection instead
     */
    get WebManager(): WebManager {
        return this._WebManager
    }

    /**
     * @deprecated use dependency injection instead
     */
    get InstancesManager(): InstancesManager {
        return this._InstancesManager
    }

    /**
     * @deprecated use dependency injection instead
     */
    get ProfilesManager(): ProfilesManager {
        return this._ProfilesManager
    }

    /**
     * @deprecated use dependency injection instead
     */
    get AuthlibManager(): AuthlibManager {
        return this._AuthlibManager
    }

    /**
     * @deprecated use dependency injection instead
     */
    get UpdateManager(): UpdateManager {
        return this._UpdateManager
    }

    private printVersion() {
        LogHelper.raw(
            chalk.bold(
                chalk.cyan("AuroraLauncher ") +
                    chalk.green("LauncherServer ") +
                    chalk.yellow(`v${version}`) +
                    chalk.green(
                        `\nCopyright (C) 2020 - ${new Date().getFullYear()} `
                    ) +
                    chalk.blue("AuroraTeam (https://github.com/AuroraTeam)") +
                    chalk.green("\nLicensed under the MIT License") +
                    chalk.green("\nDocumentation page: ") +
                    chalk.blue("https://docs.aurora-launcher.ru/")
            )
        )
    }
}

/**
 * @deprecated use dependency injection instead
 */
export const App = container.resolve(LauncherServer)
