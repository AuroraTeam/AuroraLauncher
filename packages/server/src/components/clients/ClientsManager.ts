import fs from "fs/promises";
import { join } from "path";

import { HashHelper, HashedFile } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { LogHelper, StorageHelper } from "@root/helpers";

import { LangManager } from "../langs/LangManager";

@Service([LangManager])
export class ClientsManager {
    readonly hashedClients = new Map<string, HashedFile[]>();

    constructor(
        private readonly langManager: LangManager,
        client?: string,
    ) {
        this.hashClients(client);
    }

    async hashClients(client?: string): Promise<void> {
        const folders = await fs.readdir(StorageHelper.clientsDir, {
            withFileTypes: true,
        });
        let dirs = folders.filter((folder) => folder.isDirectory());
        if (client !== undefined) {
            dirs = folders.filter((folder) => folder.name == client);
        }

        if (dirs.length === 0) {
            return LogHelper.info(this.langManager.getTranslate.ClientsManager.syncSkip);
        }

        LogHelper.info(this.langManager.getTranslate.ClientsManager.sync);

        const tasks = dirs.map((folder) => async () => {
            const startTime = Date.now();
            const hashedFiles = await this.hashDir(join(StorageHelper.clientsDir, folder.name));

            this.hashedClients.set(folder.name, hashedFiles);

            LogHelper.info(
                this.langManager.getTranslate.ClientsManager.syncTime,
                folder.name,
                Date.now() - startTime,
            );
        });

        await Promise.all(tasks.map((task) => task()));

        LogHelper.info(this.langManager.getTranslate.ClientsManager.syncEnd);
    }

    private async hashDir(dirPath: string): Promise<HashedFile[]> {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        const arrayOfFiles: HashedFile[] = [];

        for (const entry of entries) {
            const entryPath = join(dirPath, entry.name);
            if (entry.isDirectory()) {
                arrayOfFiles.push(...(await this.hashDir(entryPath)));
            } else {
                arrayOfFiles.push(await this.hashFile(entryPath));
            }
        }

        return arrayOfFiles;
    }

    async hashFile(path: string): Promise<HashedFile> {
        const size = (await fs.stat(path)).size;

        return {
            path: path.replace(StorageHelper.clientsDir, ""),
            size,
            sha1: await HashHelper.getHashFromFile(path, "sha1"),
        };
    }
}
