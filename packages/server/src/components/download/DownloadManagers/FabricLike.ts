import { resolve } from "path";

import { ProfileLibrary } from "@root/components/profiles/utils/ProfileConfig";
import {
    HashHelper,
    HttpHelper,
    LogHelper,
    ProgressHelper,
    StorageHelper,
} from "@root/utils";

import { Library } from "../interfaces/IFabric";
import { MojangManager } from "./Mojang";

export class FabricLikeManager extends MojangManager {
    protected async resolveLibraries(
        libraries: Library[],
        loaderName: string
    ): Promise<ProfileLibrary[]> {
        LogHelper.info(`Downloading ${loaderName} libraries`);

        const progressBar = ProgressHelper.getProgress(
            "{bar} {percentage}% {value}/{total}",
            40
        );
        progressBar.start(libraries.length, 0);

        const librariesList = libraries.map((library) => ({
            ...library,
            path: this.getLibPath(library.name),
        }));

        try {
            await HttpHelper.downloadFiles(
                librariesList.map((l) => ({
                    path: l.path,
                    url: `${l.url}${l.path}`,
                })),
                StorageHelper.librariesDir,
                {
                    afterDownload() {
                        progressBar.increment();
                    },
                }
            );
        } catch (error) {
            LogHelper.info(`Downloading ${loaderName} libraries failed`);
            LogHelper.debug(error);
            return;
        } finally {
            progressBar.stop();
        }
        LogHelper.info(`${loaderName} libraries downloaded`);

        return Promise.all(
            librariesList.map(async (library) => {
                const filePath = resolve(
                    StorageHelper.librariesDir,
                    library.path
                );

                return {
                    path: library.path,
                    sha1: await HashHelper.getSHA1fromFile(filePath),
                    type: "library",
                };
            })
        );
    }
}
