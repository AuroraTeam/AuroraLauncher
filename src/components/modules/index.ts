import fs from "fs/promises"
import path from "path"

import { LauncherServer } from "@root/LauncherServer"
import {
    LauncherServerModule,
    LogHelper,
    ModuleInfo,
    StorageHelper,
} from "@root/utils"
import chalk from "chalk"
import { delay, inject, injectable, singleton } from "tsyringe"

import { LangManager } from "../langs"

@singleton()
@injectable()
export class ModulesManager {
    public static modulesList = new Map<ModuleInfo, LauncherServerModule[]>()
    constructor(
        private readonly langManager: LangManager,
        @inject(delay(() => LauncherServer))
        private readonly app: LauncherServer
    ) {
        this.loadModules()
    }

    async loadModules(): Promise<void> {
        try {
            LogHelper.info(
                this.langManager.getTranslate.ModulesManager.loadingStart
            )
            const startTime = Date.now()

            const files = await fs.readdir(StorageHelper.modulesDir, {
                withFileTypes: true,
            })
            const moduleFiles = files.filter(
                (file) => file.isFile() && file.name.endsWith(".js")
            )

            if (moduleFiles.length === 0) {
                LogHelper.info(
                    this.langManager.getTranslate.ModulesManager.loadingSkip
                )
                return
            }

            await Promise.all(
                moduleFiles.map((file) => this.loadModule(file.name))
            )

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
     * Загружает модуль из директории модулей и, если он действителен, добавляет его в список модулей
     * @param {string} moduleName - Имя модуля, который нужно загрузить
     */
    private async loadModule(moduleName: string): Promise<void> {
        try {
            const modulePath = path.resolve(
                StorageHelper.modulesDir,
                moduleName
            )

            const { Module } = await import(modulePath)

            // TODO validate

            ModulesManager.modulesList.set(
                Module.getInfo(),
                new Module().init(this.app)
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
     * Вывод списка загруженных модулей
     */
    public static listModules(): void {
        LogHelper.info("Загруженные модули:")

        ModulesManager.modulesList.forEach((value, key) => {
            LogHelper.info(`${chalk.bold(key.name)} - ${key.description}`)
        })
    }
}
