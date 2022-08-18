import fs from "fs"
import path from "path"

import { LogHelper } from "@root/helpers/LogHelper"
import { StorageHelper } from "@root/helpers/StorageHelper"
import { App } from "@root/LauncherServer"

export class ModulesManager {
    private modulesList: Map<any, any> = new Map() // TODO

    constructor() {
        this.loadModules()
    }

    async loadModules() {
        try {
            LogHelper.info(App.LangManager.getTranslate().ModulesManager.loadingStart)
            const startTime = Date.now()

            const files = fs
                .readdirSync(StorageHelper.modulesDir, { withFileTypes: true })
                .filter((folder) => folder.isFile() && folder.name.endsWith(".js"))

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

            this.modulesList.set(Module.getInfo(), new Module().init(App))
        } catch (error) {
            LogHelper.debug(error.message)
            LogHelper.fatal(App.LangManager.getTranslate().ModulesManager.moduleLoadingErr, moduleName)
        }
    }
}
