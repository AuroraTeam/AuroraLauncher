import fs from "fs"
import path from "path"

import { LogHelper } from "@root/helpers/LogHelper"
import { StorageHelper } from "@root/helpers/StorageHelper"
import { App } from "@root/LauncherServer"
import chalk from "chalk"

import { AbstractModule, IGetInfo } from "./AbstractModule"

export class ModulesManager {
    public static modulesList: Map<IGetInfo, AbstractModule[]> = new Map()

    constructor() {
        this.loadModules()
    }

    async loadModules() {
        try {
            LogHelper.info(App.LangManager.getTranslate().ModulesManager.loadingStart)
            const startTime = Date.now()

            const files = fs
                .readdirSync(StorageHelper.modulesDir, { withFileTypes: true })
                .filter((file) => file.isFile() && file.name.endsWith(".js"))

            if (files.length === 0) return LogHelper.info(App.LangManager.getTranslate().ModulesManager.loadingSkip)

            await Promise.all(files.map((file) => this.loadModule(file.name)))

            LogHelper.info(App.LangManager.getTranslate().ModulesManager.loadingEnd, Date.now() - startTime)
        } catch (error) {
            LogHelper.debug(error.message)
            LogHelper.error(`${App.LangManager.getTranslate().ModulesManager.loadingErr}`)
        }
    }

    private async loadModule(moduleName: string) {
        try {
            const modulePath = path.resolve(StorageHelper.modulesDir, moduleName)

            const { Module } = await require(modulePath)

            // TODO validate

            ModulesManager.modulesList.set(Module.getInfo(), new Module().init(App))
        } catch (error) {
            LogHelper.debug(error.message)
            LogHelper.error(App.LangManager.getTranslate().ModulesManager.moduleLoadingErr, moduleName)
        }
    }

    public static listModules() {
        LogHelper.info("Загруженные модули:")

        ModulesManager.modulesList.forEach((value, key) => {
            LogHelper.info(`${chalk.bold(key.name)} - ${key.description}`)
        })
    }
}
