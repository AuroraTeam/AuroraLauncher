import fs from "fs/promises";
import { join } from "path";

import { HashHelper, LogHelper, StorageHelper } from "@root/utils";
import { injectable, singleton } from "tsyringe";

import { LangManager } from "../langs";

type HashedFile = {
    path: string;
    hashsum: string;
};

@singleton()
@injectable()
export class ClientsManager {
    readonly hashedInstances = new Map<string, HashedFile[]>();

    constructor(private readonly langManager: LangManager) {
        this.hashInstances();
    }

    private async hashInstances(): Promise<void> {
        const folders = await fs.readdir(StorageHelper.clientsDir, {
            withFileTypes: true,
        });
        const dirs = folders.filter((folder) => folder.isDirectory());

        if (dirs.length === 0) {
            return LogHelper.info(
                this.langManager.getTranslate.ClientsManager.syncSkip
            );
        }

        LogHelper.info(this.langManager.getTranslate.ClientsManager.sync);

        for (const { name } of dirs) {
            const startTime = Date.now();

            this.hashedInstances.set(
                name,
                await this.hashDir(join(StorageHelper.clientsDir, name))
            );

            LogHelper.info(
                this.langManager.getTranslate.ClientsManager.syncTime,
                name,
                Date.now() - startTime
            );
        }

        LogHelper.info(this.langManager.getTranslate.ClientsManager.syncEnd);
    }

    private async hashDir(
        dirPath: string,
        arrayOfFiles: HashedFile[] = []
    ): Promise<HashedFile[]> {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = join(dirPath, entry.name);
            if (entry.isDirectory()) {
                arrayOfFiles = await this.hashDir(entryPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(await this.hashFile(entryPath));
            }
        }

        return arrayOfFiles;
    }

    async hashFile(path: string): Promise<HashedFile> {
        return {
            path: path.replace(StorageHelper.clientsDir, ""),
            hashsum: await HashHelper.getSHA1fromFile(path),
        };
    }
}
