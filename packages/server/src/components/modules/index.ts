import fs from "fs/promises";
import path from "path";

import { LauncherServer } from "@root/LauncherServer";
import {
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
    private static readonly modulesList = new Map<
        IModuleInfo,
        ILauncherServerModule[]
    >();
    private readonly moduleQueue: string[] = [];
    private readonly pendingDependencies: Map<string, string> = new Map();

    constructor(
        private readonly langManager: LangManager,
        @inject(delay(() => LauncherServer))
        private readonly app: LauncherServer
    ) {
        this.loadModules()
    }

    /**
     * Загружает модули
     */
    public async loadModules(): Promise<void> {
        try {
            LogHelper.info(
                this.langManager.getTranslate.ModulesManager.loadingStart
            );
            const startTime = Date.now();

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

            LogHelper.info(
                this.langManager.getTranslate.ModulesManager.loadingEnd,
                Date.now() - startTime
            );
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
    }

    /**
     * Загружает модуль
     * @param {string} moduleName - Имя модуля, который нужно загрузить
     */
    private async loadModule(moduleName: string): Promise<void> {
        try {
            const modulePath = path.resolve(
                StorageHelper.modulesDir,
                moduleName
            );
            const moduleUrl = `file://${modulePath}`;
            const module = (await import(moduleUrl)).Module;

            if (!this.isValidModule(module)) {
                //TODO: LOG
                return LogHelper.dev("invalid");
            }

            const dependencies = module.getInfo().dependencies || {};
            if (!this.areDependenciesLoaded(dependencies)) {
                this.pendingDependencies.set(
                    moduleName,
                    JSON.stringify(dependencies)
                );
                return;
            }

            if (!ModulesManager.modulesList.has(module.getInfo())) {
                this.verifyDependencyVersions(moduleName, dependencies);
                ModulesManager.modulesList.set(
                    module.getInfo(),
                    new module().init(this.app)
                );
            }

            this.checkPendingDependencies();
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
        for (const dependency in dependencies) {
            if (!this.isDependencyLoaded(dependency)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Проверяет, загружена ли зависимость
     * @param {string} dependency - Зависимость
     * @returns {boolean} true, если зависимость загружена; в противном случае - false
     */
    private isDependencyLoaded(dependency: string): boolean {
        const [dependencyName] = dependency.split("@");

        for (const [moduleInfo] of ModulesManager.modulesList) {
            if (moduleInfo.name === dependencyName) {
                return true;
            }
        }
        return false;
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
        )
    }

    /**
     * Проверяет зависимости модуля и их версии
     * @param {string} moduleName - Имя модуля
     * @param {Record<string, string>} dependencies - Зависимости модуля
     */
    private verifyDependencyVersions(
        moduleName: string,
        dependencies: Record<string, string>
    ): void {
        for (const dependency in dependencies) {
            const [dependencyName, dependencyRange] = dependency.split("@");

            for (const [moduleInfo] of ModulesManager.modulesList) {
                if (moduleInfo.name === dependencyName) {
                    const dependencyVersion = moduleInfo.version;

                    if (!satisfies(dependencyVersion, dependencyRange)) {
                        return LogHelper.error(
                            `Модуль "${moduleName}" требует версию "${dependency}" ${dependencyRange}, но найдена версия ${dependencyVersion}.`
                        );
                    }

                    return;
                }
            }

            LogHelper.error(`Модуль "${moduleName}" не найдена зависимость "${dependency}".`);
        }
    }

    /**
     * Проверяет и загружает модули с ожидающими зависимостями
     */
    private checkPendingDependencies(): void {
        for (const moduleName in this.pendingDependencies) {
            const dependencies = JSON.parse(
                this.pendingDependencies.get(moduleName)
            );

            if (this.areDependenciesLoaded(dependencies)) {
                this.pendingDependencies.delete(moduleName);
                this.verifyDependencyVersions(moduleName, dependencies);
                this.loadModule(moduleName);
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
}
