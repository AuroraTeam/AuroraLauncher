import fs from "fs"
import path from "path"

import { LauncherServer } from "@root/app"
import { AbstractModule, IGetInfo } from "@root/utils"
import { LogHelper, StorageHelper } from "@root/utils/"
import chalk from "chalk"
import { container, injectable, singleton } from "tsyringe"

import { LangManager } from "../langs"

@singleton()
@injectable()
export class ModulesManager {
    public static modulesList: Map<IGetInfo, AbstractModule[]> = new Map()

    constructor(private readonly langManager: LangManager) {
        this.loadModules()
    }

    async loadModules(): Promise<void> {
        try {
            LogHelper.info(
                this.langManager.getTranslate.ModulesManager.loadingStart
            )
            const startTime = Date.now()

            const files = fs
                .readdirSync(StorageHelper.modulesDir, { withFileTypes: true })
                .filter((file) => file.isFile() && file.name.endsWith(".js"))

            if (files.length === 0)
                return LogHelper.info(
                    this.langManager.getTranslate.ModulesManager.loadingSkip
                )

            await Promise.all(files.map((file) => this.loadModule(file.name)))

            LogHelper.info(
                this.langManager.getTranslate.ModulesManager.loadingEnd,
                Date.now() - startTime
            )
        } catch (error) {
            LogHelper.debug(error.message)
            LogHelper.error(
                this.langManager.getTranslate.ModulesManager.loadingErr
            )
        }
    }

    /**
     * It loads a module from the modules directory, and if it's valid, it adds it to the modules list
     * @param {string} moduleName - The name of the module to load
     */
    private async loadModule(moduleName: string): Promise<void> {
        try {
            const modulePath = path.resolve(
                StorageHelper.modulesDir,
                moduleName
            )

            const { Module } = await require(modulePath)

            // TODO validate

            ModulesManager.modulesList.set(
                Module.getInfo(),
                new Module().init(container)
            )
        } catch (error) {
            LogHelper.debug(error.message)
            LogHelper.error(
                this.langManager.getTranslate.ModulesManager.moduleLoadingErr,
                moduleName
            )
        }
    }

    /**
     * It lists all the modules that are loaded.
     */
    public static listModules(): void {
        LogHelper.info("Загруженные модули:")

        ModulesManager.modulesList.forEach((value, key) => {
            LogHelper.info(`${chalk.bold(key.name)} - ${key.description}`)
        })
    }
}
