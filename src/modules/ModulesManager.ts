import { execSync } from "child_process"
import * as fs from "fs"
import * as fsProm from "fs/promises"
import * as path from "path"

import { LogHelper } from "@root/helpers/LogHelper"
import { StorageHelper } from "@root/helpers/StorageHelper"
import { App } from "@root/LauncherServer"

export class ModulesManager {
    private static modulesList: any[] = []

    constructor() {
        this.loadModules()
    }

    async loadModules() {
        try {
            LogHelper.info(App.LangManager.getTranslate().ModulesManager.loadingStart)

            const folders = fs
                .readdirSync(StorageHelper.modulesDir, { withFileTypes: true })
                .filter((folder) => folder.isDirectory())

            if (!fs.existsSync(path.resolve(StorageHelper.modulesDir, "plugins.json")) || folders.length === 0)
                return LogHelper.info(App.LangManager.getTranslate().ModulesManager.loadingSkip)

            const moduleList = JSON.parse(
                fs.readFileSync(path.resolve(StorageHelper.modulesDir, "plugins.json")).toString()
            )
            const startTime = Date.now()

            moduleList.map(async (plugin: string) => {
                await ModulesManager.loadModule(plugin)
            })

            LogHelper.info(App.LangManager.getTranslate().ModulesManager.loadingEnd, Date.now() - startTime)
        } catch (error) {
            LogHelper.debug(error.message)
            LogHelper.error(`${App.LangManager.getTranslate().ModulesManager.loadingErr}`)
            return
        }
    }

    private static async loadModule(moduleName: string) {
        try {
            const modulePath = path.resolve(StorageHelper.modulesDir, moduleName)
            const packageJson = JSON.parse(fs.readFileSync(path.resolve(modulePath, "package.json")).toString())

            /* Проверяем, все ли депенденсы установлены */
            /* Лишнее, думаю имеет смысл просто паковать зависимости с модулем и сохранять модуль как один файл */
            if (
                packageJson.dependencies &&
                !(await fsProm
                    .access(`${path.resolve(modulePath, `node_modules`)}`)
                    .then(() => true)
                    .catch(() => false))
            ) {
                LogHelper.warn(App.LangManager.getTranslate().ModulesManager.downloadModuleDependencies, moduleName)
                execSync(`cd ${modulePath} && npm install`, { stdio: "inherit" })
            }

            /* Проверяем, собранный ли модуль нам вкинули */
            if (
                packageJson.scripts &&
                packageJson.scripts.build &&
                !(await fsProm
                    .access(`${path.resolve(modulePath, `lib`)}`)
                    .then(() => true)
                    .catch(() => false))
            ) {
                LogHelper.warn(App.LangManager.getTranslate().ModulesManager.buildModule, moduleName)
                execSync(`cd ${modulePath} && npm run build`, { stdio: "inherit" })
            }

            const { default: rawModuleClass } = await import(`file:///${modulePath}/${packageJson.main}`)

            const ModuleClass = this.classCheck(rawModuleClass) ? rawModuleClass : rawModuleClass.default

            const moduleInfo = {
                name: moduleName,
                instance: new ModuleClass(),
            }

            this.modulesList.push(moduleInfo)
        } catch (error) {
            LogHelper.debug(error.message)
            LogHelper.fatal(App.LangManager.getTranslate().ModulesManager.moduleLoadingErr, moduleName)
            return
        }
    }

    private static classCheck(object: any) {
        const isConstructorClass = object.constructor && object.constructor.toString().substring(0, 5) === "class"

        if (object.prototype === undefined) return isConstructorClass

        const isPrototypeConstructorClass =
            object.prototype.constructor &&
            object.prototype.constructor.toString &&
            object.prototype.constructor.toString().substring(0, 5) === "class"

        return isConstructorClass || isPrototypeConstructorClass
    }
}
