import { PathLike, existsSync, mkdirSync } from "fs";
import { rm } from "fs/promises";
import { dirname, resolve } from "path";

import { StorageHelper as CoreStorageHelper } from "@auroralauncher/core";

import { SystemHelper } from "./SystemHelper";

export class StorageHelper extends CoreStorageHelper {
    /* Folders */
    static readonly storageDir: string = SystemHelper.isStandalone()
        ? dirname(process.execPath)
        : __dirname;
    static readonly clientsDir: string = resolve(this.storageDir, "clients");
    static readonly modulesDir: string = resolve(this.storageDir, "modules");
    static readonly authlibDir: string = resolve(this.storageDir, "authlib");
    static readonly logsDir: string = resolve(this.storageDir, "logs");

    static validate() {
        const foldersToCreate: PathLike[] = [
            this.clientsDir,
            this.modulesDir,
            this.authlibDir,
            this.logsDir,
        ];

        for (const folder of foldersToCreate) {
            if (!existsSync(folder)) {
                mkdirSync(folder);
            }
        }
    }

    static rmdirRecursive(path: PathLike) {
        return rm(path, { recursive: true, force: true });
    }
}
