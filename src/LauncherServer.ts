import "source-map-support/register"
import "reflect-metadata"

import { EventEmitter } from "events"

import chalk from "chalk"

import { version } from "../package.json"
import { WebManager } from "./api/WebManager"
import { AuthManager } from "./auth/AuthManager"
import { AuthlibManager } from "./authlib/AuthlibManager"
import { CommandsManager } from "./commands/CommandsManager"
import { ConfigManager } from "./config/ConfigManager"
import { LogHelper } from "./helpers/LogHelper"
import { StorageHelper } from "./helpers/StorageHelper"
import { InstancesManager } from "./instances/InstancesManager"
import { LangManager } from "./langs/LangManager"
import { ModulesManager } from "./modules/ModulesManager"
import { ProfilesManager } from "./profiles/ProfilesManager"
import { UpdateManager } from "./update/UpdateManager"

export class LauncherServer extends EventEmitter {
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
    private inited = false

    main(): void {
        if (this.inited) return

        StorageHelper.createMissing()
        this.printVersion()

        LogHelper.info("Initialization start")
        this._ConfigManager = new ConfigManager()
        this._LangManager = new LangManager()
        this._AuthManager = new AuthManager()
        this._AuthlibManager = new AuthlibManager()
        this._CommandsManager = new CommandsManager()
        this._WebManager = new WebManager()
        this._InstancesManager = new InstancesManager()
        this._ProfilesManager = new ProfilesManager()
        this._ModulesManager = new ModulesManager()
        this._UpdateManager = new UpdateManager()

        this.emit("postInit")
        LogHelper.info(this.LangManager.getTranslate().LauncherServer.initEnd)
        this.inited = true
    }

    public reload() {
        this._ConfigManager = new ConfigManager()
        this._LangManager = new LangManager()
        this._AuthManager = new AuthManager()
        this._AuthlibManager = new AuthlibManager()
        this._CommandsManager = new CommandsManager()
        this._InstancesManager = new InstancesManager()
        this._ProfilesManager = new ProfilesManager()
        this._ModulesManager = new ModulesManager()
        this._UpdateManager = new UpdateManager()
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
                    chalk.green(`\nCopyright (C) 2020 - ${new Date().getFullYear()} `) +
                    chalk.blue("AuroraTeam (https://github.com/AuroraTeam)") +
                    chalk.green("\nLicensed under the MIT License") +
                    chalk.green("\nDocumentation page: ") +
                    chalk.blue("https://docs.aurora-launcher.ru/")
            )
        )
    }
}

export const App = new LauncherServer()
App.main()

export declare interface LauncherServer {
    on(event: "postInit", listener: () => void): this
    once(event: "postInit", listener: () => void): this
    addListener(event: "postInit", listener: () => void): this
    removeListener(event: "postInit", listener: () => void): this
    emit(event: "postInit"): boolean

    /* eslint-disable @typescript-eslint/adjacent-overload-signatures */
    on(event: "close", listener: () => void): this
    once(event: "close", listener: () => void): this
    addListener(event: "close", listener: () => void): this
    removeListener(event: "close", listener: () => void): this
    emit(event: "close"): boolean
}
