import fs from "fs/promises";
import path from "path";

import { LauncherServer } from "@root/LauncherServer";
import {
    IDependencies,
    ILauncherServerModule,
    IModuleInfo,
    LogHelper,
    StorageHelper,
} from "@root/utils";
import chalk from "chalk";
import { satisfies } from "semver";
import { delay, inject, injectable, singleton } from "tsyringe";

import { LangManager } from "../langs";

@singleton()
@injectable()
export class ModulesManager {
    private static readonly modulesList: Map<
        IModuleInfo,
        ILauncherServerModule[]
    > = new Map();
    private readonly moduleQueue: string[] = [];
    private readonly pendingDependencies: Map<string, IDependencies> =
        new Map();

    constructor(
        private readonly langManager: LangManager,
        @inject(delay(() => LauncherServer))
        private readonly app: LauncherServer
    ) {
        const startTime = Date.now();

        this.loadModules().then(() => {
            LogHelper.info(
                this.langManager.getTranslate.ModulesManager.loadingEnd,
                Date.now() - startTime
            );
        });
    }

    /**
     * Загружает модули
     */
    public async loadModules(): Promise<void> {
        try {
            LogHelper.info(
                this.langManager.getTranslate.ModulesManager.loadingStart
            );

            const files = await fs.readdir(StorageHelper.modulesDir, {
                withFileTypes: true,
            });
            const moduleFiles = files
                .filter((file) => file.isFile() && file.name.endsWith(".js"))
                .map((file) => file.name);

            if (moduleFiles.length === 0) {
                LogHelper.info(
                    this.langManager.getTranslate.ModulesManager.loadingSkip
                );
                return;
            }

            this.moduleQueue.push(...moduleFiles);
            await this.processModuleQueue();
        } catch (error) {
            LogHelper.debug(error.message);
            LogHelper.error(
                this.langManager.getTranslate.ModulesManager.loadingErr
            );
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

        await this.checkPendingDependencies();
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

            const modulePath = path.resolve(
                StorageHelper.modulesDir,
                moduleName
            );
            const moduleUrl = `file://${modulePath}`;
            const module = (await import(moduleUrl)).Module;

            if (!this.isValidModule(module)) {
                //TODO: LOG
                LogHelper.dev("invalid");
                return;
            }

            const dependencies = module.getInfo().dependencies || {};

            if (Object.keys(dependencies).length > 0) {
                if (!this.areDependenciesLoaded(dependencies)) {
                    this.pendingDependencies.set(moduleName, dependencies);
                    return;
                }

                if (!this.verifyDependencyVersions(moduleName, dependencies)) {
                    return;
                }
            }

            if (!ModulesManager.modulesList.has(module.getInfo())) {
                ModulesManager.modulesList.set(
                    module.getInfo(),
                    new module().init(this.app)
                );
            }
        } catch (error) {
            LogHelper.debug(error.message);
            LogHelper.error(
                this.langManager.getTranslate.ModulesManager.moduleLoadingErr,
                moduleName
            );
        }
    }

    /**
     * Проверяет, все ли зависимости загружены
     * @param {Record<string, string>} dependencies - Зависимости модуля
     * @returns {boolean} true, если все зависимости загружены; в противном случае - false
     */
    private areDependenciesLoaded(
        dependencies: Record<string, string>
    ): boolean {
        const unloadedDependencies = this.getUnloadedDependencies(dependencies);
        return unloadedDependencies.length === 0;
    }

    /**
     * Получает список незагруженных зависимостей
     * @param {Record<string, string>} dependencies - Зависимости модуля
     * @returns {string[]} Массив незагруженных зависимостей
     */
    private getUnloadedDependencies(
        dependencies: Record<string, string>
    ): string[] {
        return Object.keys(dependencies).filter(
            (dependency) => !this.isDependencyLoaded(dependency)
        );
    }

    /**
     * Проверяет, загружена ли зависимость
     * @param {string} dependency - Зависимость
     * @returns {boolean} true, если зависимость загружена; в противном случае - false
     */
    private isDependencyLoaded(dependency: string): boolean {
        const [dependencyName] = dependency.split("@");

        return this.hasModule(dependencyName)
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
     * Проверяет зависимости модуля и их версии
     * @param {string} moduleName - Имя модуля
     * @param {Record<string, string>} dependencies - Зависимости модуля
     */
    private verifyDependencyVersions(
        moduleName: string,
        dependencies: Record<string, string>
    ): boolean {
        for (const [dependency, dependencyRange] of Object.entries(
            dependencies
        )) {
            const [dependencyName] = dependency.split("@");

            for (const [moduleInfo] of ModulesManager.modulesList) {
                if (moduleInfo.name === dependencyName) {
                    const dependencyVersion = moduleInfo.version;

                    if (!satisfies(dependencyVersion, dependencyRange)) {
                        LogHelper.error(
                            `Модуль "${moduleName}" требует версию "${dependencyName}: ${dependencyRange}", но найдена версия ${dependencyVersion}.`
                        );
                        return false;
                    }

                    return true;
                }
            }
        }
    }

    /**
     * Проверяет и загружает модули с ожидающими зависимостями
     */
    private async checkPendingDependencies(): Promise<void> {
        for (const [moduleName, dependencies] of this.pendingDependencies) {
            const unloadedDependencies =
                this.getUnloadedDependencies(dependencies);

            if (unloadedDependencies.length > 0) {
                LogHelper.error(
                    `Модуль "${moduleName}" не нашел зависимости: ${unloadedDependencies.join(
                        ", "
                    )}.`
                );
            } else {
                this.pendingDependencies.delete(moduleName);
                await this.loadModule(moduleName);
            }
        }
    }

    /**
     * Выводит список загруженных модулей
     */
    public static listModules(): void {
        LogHelper.info("Загруженные модули:");

        ModulesManager.modulesList.forEach((value, key) => {
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
            (moduleInfo) => moduleInfo.name === moduleName
        );
    }
}
