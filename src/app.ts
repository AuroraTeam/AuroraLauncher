import "source-map-support/register"
import "reflect-metadata"

import chalk from "chalk"

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
import { LogHelper, StorageHelper } from "./utils"

export class LauncherServer {
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
        LogHelper.dev("aboba")
        this._ConfigManager = new ConfigManager()
        this._LangManager = new LangManager(this._ConfigManager)
        this._AuthManager = new AuthManager(
            this.ConfigManager,
            this.LangManager
        )
        this._AuthlibManager = new AuthlibManager(this.LangManager)
        this._CommandsManager = new CommandsManager(
            this._LangManager,
            this._ModulesManager,
            this._UpdateManager,
            this._ProfilesManager,
            this._InstancesManager,
            this
        )
        this._WebManager = new WebManager(this.ConfigManager, this.LangManager)
        this._InstancesManager = new InstancesManager(this.LangManager)
        this._ProfilesManager = new ProfilesManager(this.LangManager)
        this._ModulesManager = new ModulesManager(this.LangManager, this)
        this._UpdateManager = new UpdateManager(
            this.ConfigManager,
            this.LangManager
        )

        LogHelper.info(this.LangManager.getTranslate.LauncherServer.initEnd)
    }

    /**
     * It reload the LauncherServer.
     */
    public reload() {
        this._ConfigManager = new ConfigManager()
        this._LangManager = new LangManager(this._ConfigManager)
        this._AuthManager = new AuthManager(
            this.ConfigManager,
            this.LangManager
        )
        this._AuthlibManager = new AuthlibManager(this.LangManager)
        this._CommandsManager = new CommandsManager(
            this._LangManager,
            this._ModulesManager,
            this._UpdateManager,
            this._ProfilesManager,
            this._InstancesManager,
            this
        )
        this._InstancesManager = new InstancesManager(this.LangManager)
        this._ProfilesManager = new ProfilesManager(this.LangManager)
        this._ModulesManager = new ModulesManager(this.LangManager, this)
        this._UpdateManager = new UpdateManager(
            this.ConfigManager,
            this.LangManager
        )
    }

    get ConfigManager(): ConfigManager {
        return this._ConfigManager
    }

    get LangManager(): LangManager {
        return this._LangManager
    }

    get AuthManager(): AuthManager {
        return this._AuthManager
    }

    get CommandsManager(): CommandsManager {
        return this._CommandsManager
    }

    get ModulesManager(): ModulesManager {
        return this._ModulesManager
    }

    get WebManager(): WebManager {
        return this._WebManager
    }

    get InstancesManager(): InstancesManager {
        return this._InstancesManager
    }

    get ProfilesManager(): ProfilesManager {
        return this._ProfilesManager
    }

    get AuthlibManager(): AuthlibManager {
        return this._AuthlibManager
    }

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
export const App = new LauncherServer()
