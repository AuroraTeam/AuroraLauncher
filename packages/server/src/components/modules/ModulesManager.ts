import fs from "fs/promises";
import path from "path";

import { ILauncherServerModule, IModuleInfo } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { LogHelper, StorageHelper } from "@root/helpers";
import { LauncherServer } from "@root/LauncherServer";
import chalk from "chalk";

import { LangManager } from "../langs/LangManager";

@Service([LangManager])
export class ModulesManager {
    private static readonly modulesList: Map<IModuleInfo, ILauncherServerModule[]> = new Map();
    private readonly moduleQueue: string[] = [];

    constructor(
        private readonly langManager: LangManager,
        // TODO Нужен другой вариант, "позднее связывание" для модулей не катит
        private readonly app: LauncherServer,
    ) {
        this.loadModules();
    }

    /**
     * Загружает модули
     */
    public async loadModules(): Promise<void> {
        try {
            LogHelper.info(this.langManager.getTranslate.ModulesManager.loadingStart);
            const startTime = Date.now();

            const files = await fs.readdir(StorageHelper.modulesDir, {
                withFileTypes: true,
            });
            const moduleFiles = files
                .filter((file) => file.isFile() && file.name.endsWith(".js"))
                .map((file) => file.name);

            if (moduleFiles.length === 0) {
                LogHelper.info(this.langManager.getTranslate.ModulesManager.loadingSkip);
                return;
            }

            this.moduleQueue.push(...moduleFiles);
            await this.processModuleQueue();

            LogHelper.info(
                this.langManager.getTranslate.ModulesManager.loadingEnd,
                Date.now() - startTime,
            );
        } catch (error) {
            LogHelper.debug((error as Error).message);
            LogHelper.error(this.langManager.getTranslate.ModulesManager.loadingErr);
        }
    }

    /**
     * Обрабатывает очередь модулей для загрузки
     */
    private async processModuleQueue(): Promise<void> {
        while (this.moduleQueue.length > 0) {
            const moduleName = this.moduleQueue.shift();

            if (moduleName) {
                await this.loadModule(moduleName);
            }
        }
    }

    /**
     * Загружает модуль
     * @param {string} moduleName - Имя модуля, который нужно загрузить
     */
    private async loadModule(moduleName: string): Promise<void> {
        try {
            if (this.hasModule(moduleName)) {
                LogHelper.debug(`Модуль "${moduleName}" уже загружен.`);
                return;
            }

            const modulePath = path.resolve(StorageHelper.modulesDir, moduleName);
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const module = require(modulePath).Module;

            if (!this.isValidModule(module)) {
                LogHelper.dev(
                    "Invalid module. Please check it's structure or contact with author for correction.",
                );
                return;
            }

            if (!ModulesManager.modulesList.has(module.getInfo())) {
                ModulesManager.modulesList.set(module.getInfo(), new module().init(this.app));
            }
        } catch (error) {
            LogHelper.debug((error as Error).message);
            LogHelper.error(
                this.langManager.getTranslate.ModulesManager.moduleLoadingErr,
                moduleName,
            );
        }
    }

    /**
     * Проверяет, является ли модуль допустимым
     * @param {any} module - Загруженный модуль
     * @returns {boolean} true, если модуль допустим; в противном случае - false
     */
    private isValidModule(module: any): boolean {
        const moduleInfo = module.getInfo();

        return (
            typeof module === "function" &&
            typeof moduleInfo === "object" &&
            "name" in moduleInfo &&
            "version" in moduleInfo &&
            "description" in moduleInfo &&
            "author" in moduleInfo &&
            typeof module.prototype.init === "function"
        );
    }

    /**
     * Выводит список загруженных модулей
     */
    public static listModules(): void {
        LogHelper.info("Загруженные модули:");

        ModulesManager.modulesList.forEach((_value, key) => {
            LogHelper.info(`${chalk.bold(key.name)} - ${key.description}`);
        });
    }

    /**
     * Проверяет наличие загруженного модуля
     * @param moduleName - Имя модуля
     * @returns true, если модуль загружен; в противном случае - false
     */
    private hasModule(moduleName: string): boolean {
        return Array.from(ModulesManager.modulesList.keys()).some(
            (moduleInfo) => moduleInfo.name === moduleName,
        );
    }
}
