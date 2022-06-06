import { execSync } from "child_process"
import * as fs from "fs"
import * as fsProm from "fs/promises"
import * as path from "path"

import { LogHelper } from "@root/helpers/LogHelper"
import { StorageHelper } from "@root/helpers/StorageHelper"

import { BaseModule } from "./BaseModule"

export class ModulesManager {
    private static modulesList: BaseModule[] = []

    constructor() {
        this.loadModules()
    }

    public async initModules() {
        LogHelper.info("Modules initialization has started")

        await this.runTasks(ModulesManager.modulesList, "init")

        LogHelper.info("Modules successfully initializated")
    }

    async loadModules() {
        try {
            LogHelper.info("Modules loading start...")

            const folders = fs
                .readdirSync(StorageHelper.modulesDir, { withFileTypes: true })
                .filter((folder) => folder.isDirectory())

            if (!fs.existsSync(path.resolve(StorageHelper.modulesDir, "plugins.json")) || folders.length === 0)
                return LogHelper.info("Modules dir empty. Skip loading")

            const moduleList = JSON.parse(
                fs.readFileSync(path.resolve(StorageHelper.modulesDir, "plugins.json")).toString()
            )
            const startTime = Date.now()

            await Promise.all(
                moduleList.map((plugin: string) => {
                    ModulesManager.loadModule(plugin)
                })
            )

            LogHelper.info(`Modules loading ended. Total time: ${Date.now() - startTime} ms.`)
        } catch (error) {
            LogHelper.error(`${error.message}`)
        }
    }

    private static async loadModule(moduleName: string) {
        try {
            const modulesPath = path.resolve(StorageHelper.modulesDir, moduleName)
            const packageJson = JSON.parse(fs.readFileSync(path.resolve(modulesPath, "package.json")).toString())

            /* Проверяем, все ли депенденсы установлены */
            /* Лишнее, думаю имеет смысл просто паковать зависимости с модулем и сохранять модуль как один файл */
            if (
                packageJson.dependencies &&
                !(await fsProm
                    .access(`${path.resolve(modulesPath, `node_modules`)}`)
                    .then(() => true)
                    .catch(() => false))
            ) {
                LogHelper.warn(`Not all dependences are installed for the ${moduleName} module, installing...`)
                execSync(`cd ${modulesPath} && npm install`, { stdio: "inherit" })
            }

            /* Проверяем, собранный ли модуль нам вкинули */
            if (
                packageJson.scripts &&
                packageJson.scripts.build &&
                !(await fsProm
                    .access(`${path.resolve(modulesPath, `lib`)}`)
                    .then(() => true)
                    .catch(() => false))
            ) {
                LogHelper.warn(`${moduleName} module not builded, building...`)
                //Если скрипта нету, то пиздец.
                execSync(`cd ${modulesPath} && npm run build`, { stdio: "inherit" })
            }

            const { default: rawModuleClass } = await import(`file:///${modulesPath}/${packageJson.main}`)

            const ModuleClass = this.classСheck(rawModuleClass) ? rawModuleClass : rawModuleClass.default

            const moduleInfo = {
                name: moduleName,
                instance: new ModuleClass(),
            }

            this.modulesList.push(moduleInfo)
        } catch (error) {
            LogHelper.fatal(`An error occurred when trying to load the ${moduleName} module: ${error.stack}`)
        }
    }

    private static classСheck(object: any) {
        const isConstructorClass = object.constructor && object.constructor.toString().substring(0, 5) === "class"

        if (object.prototype === undefined) return isConstructorClass

        const isPrototypeConstructorClass =
            object.prototype.constructor &&
            object.prototype.constructor.toString &&
            object.prototype.constructor.toString().substring(0, 5) === "class"

        return isConstructorClass || isPrototypeConstructorClass
    }

    private async issueTask(moduleInfo: any, task: string) {
        const startTime = Date.now()

        await moduleInfo.instance[task]

        moduleInfo.tasks = moduleInfo.tasks || {}
        moduleInfo.tasks[task] = Date.now() - startTime
    }

    private async runTasks(list: any[], task: string) {
        return Promise.all(
            list.filter((module: any) => module.instance[task]).map((el: any) => this.issueTask(el, task))
        )
    }
}
