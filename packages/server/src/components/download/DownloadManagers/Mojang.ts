import { mkdir, writeFile } from "fs/promises";
import path, { resolve } from "path";

import { HttpHelper, JsonHelper, OS, ProfileLibrary } from "@aurora-launcher/core";
import { MojangAssets } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { LogHelper, ProgressHelper, StorageHelper } from "@root/helpers";

import {
    Action,
    Artifact,
    AssetIndex,
    Classifiers,
    Client,
    Library,
    Name,
    VersionProfile,
    VersionsManifest,
} from "../interfaces/IMojang";
import { AbstractDownloadManager } from "./AbstractManager";

@Service([])
export class MojangManager extends AbstractDownloadManager {
    #versionManifestLink = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
    #assetsLink = "https://resources.download.minecraft.net/";
    #librariesLink = "https://libraries.minecraft.net/";

    /**
     * Скачивание клиента с зеркала Mojang
     * @param gameVersion - Версия игры
     * @param clientName - Название сборки
     */
    async downloadClient(gameVersion: string, clientName: string): Promise<any> {
        const version = await this.getVersionInfo(gameVersion);
        if (!version) return;

        if (!(await this.#resolveClient(clientName, version.downloads.client))) {
            return;
        }
        if (!(await this.resolveAssets(version.assetIndex))) return;

        const libraries = await this.resolveLibraries(version.libraries);
        if (!libraries) return;

        return this.profilesManager.createProfile({
            version: gameVersion,
            javaVersion: version.javaVersion.majorVersion,
            clientDir: clientName,
            assetIndex: version.assets,
            libraries,
            servers: [
                {
                    ip: "127.0.0.1",
                    port: 25565,
                    title: clientName,
                },
            ],
        });
    }

    async #resolveClient(clientName: string, client: Client) {
        const clientDirPath = resolve(StorageHelper.clientsDir, clientName);

        try {
            await mkdir(clientDirPath);
        } catch {
            return LogHelper.error(this.langManager.getTranslate.DownloadManager.dirExist);
        }

        LogHelper.info(this.langManager.getTranslate.DownloadManager.MojangManager.client.download);

        const progressBar = ProgressHelper.getDownloadProgressBar();
        progressBar.start(client.size, 0, { filename: "minecraft.jar" });

        try {
            await HttpHelper.downloadFile(
                client.url,
                path.resolve(clientDirPath, "minecraft.jar"),
                {
                    onProgress: (progress) => {
                        progressBar.update(progress.transferred);
                    },
                },
            );
        } catch (error) {
            LogHelper.debug(error);
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.client.downloadErr,
            );
        } finally {
            progressBar.stop();
        }

        LogHelper.info(this.langManager.getTranslate.DownloadManager.MojangManager.client.success);
        return true;
    }

    protected async resolveAssets(assetIndex: AssetIndex) {
        const indexPath = resolve(StorageHelper.assetsIndexesDir, `${assetIndex.id}.json`);

        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MojangManager.client.downloadAssets,
        );

        const assetsFile = await HttpHelper.getResource(assetIndex.url);
        await writeFile(indexPath, assetsFile);

        const { objects } = JsonHelper.fromJson<MojangAssets>(assetsFile);

        const assetsHashes = Object.values(objects)
            .sort((a, b) => b.size - a.size)
            .map(({ hash }) => ({ hash, path: `${hash.slice(0, 2)}/${hash}` }));

        const progressBar = ProgressHelper.getProgress("{bar} {percentage}% {value}/{total}", 40);
        progressBar.start(assetsHashes.length, 0);

        // LogHelper.info(
        //     this.langManager.getTranslate.DownloadManager.MojangManager.assets
        //         .download
        // );
        try {
            await HttpHelper.downloadFiles(
                assetsHashes.map((asset) => ({
                    destinationPath: resolve(StorageHelper.assetsObjectsDir, asset.path),
                    sourceUrl: `${this.#assetsLink}${asset.path}`,
                    sha1: asset.hash,
                })),
                {
                    afterDownload() {
                        progressBar.increment();
                    },
                },
            );
        } catch (error) {
            // LogHelper.error(
            //     this.langManager.getTranslate.DownloadManager.MojangManager
            //         .assets.downloadErr
            // );
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.client
                    .downloadAssetsErr,
            );
            LogHelper.debug(error);
            return;
        } finally {
            progressBar.stop();
        }
        // LogHelper.info(
        //     this.langManager.getTranslate.DownloadManager.MojangManager.assets
        //         .success
        // );
        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MojangManager.client.downloadAssetsSuc,
        );

        return true;
    }

    protected async resolveLibraries(libraries: Library[]) {
        const librariesList = libraries
            .map((library) => {
                if (library.natives) {
                    return this.#resolveOldNative(library);
                }

                if (library.name.includes("natives")) {
                    return this.#resolveNewNative(library);
                }

                return this.#resolveLibrary(library);
            })
            .flat();

        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MojangManager.client.downloadLib,
        );
        const progressBar = ProgressHelper.getProgress("{bar} {percentage}% {value}/{total}", 40);
        progressBar.start(librariesList.length, 0);

        try {
            await HttpHelper.downloadFiles(
                librariesList.map((library) => ({
                    destinationPath: resolve(StorageHelper.librariesDir, library.path),
                    sourceUrl: `${this.#librariesLink}${library.path}`,
                    sha1: library.sha1,
                })),
                {
                    afterDownload() {
                        progressBar.increment();
                    },
                },
            );
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.client.downloadLibErr,
            );
            LogHelper.debug(error);
            return;
        } finally {
            progressBar.stop();
        }
        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MojangManager.client.downloadLibSuc,
        );

        return librariesList;
    }

    #resolveNewNative(library: Library): ProfileLibrary {
        const rules = library.rules;

        const { arch } = library.name.match(/natives-\w+(?:-(?<arch>\w+))?/)?.groups || {};
        if (arch) {
            (rules!.find((rule) => rule.action === Action.Allow)?.os as OS).arch = arch;
        }

        const { path, sha1 } = library.downloads.artifact!;
        return {
            path,
            sha1,
            type: "native",
            rules,
        };
    }

    #resolveOldNative(library: Library): ProfileLibrary[] {
        const downloads = this.#resolveRulesForNatives(library);

        const resolveNative = (
            { path, sha1 }: Artifact,
            os: Name,
            arch?: string,
        ): ProfileLibrary => {
            return {
                path,
                sha1,
                type: "native",
                rules: [
                    {
                        action: Action.Allow,
                        os: { name: os, arch },
                    },
                ],
            };
        };

        return downloads
            .map(([os, nativeIndex]) => {
                // natives-windows-${arch}
                if ((<string>nativeIndex).includes("${arch}")) {
                    return ["32", "64"].map((arch) => {
                        const formattedNativeIndex = (<string>nativeIndex).replace("${arch}", arch);
                        return resolveNative(
                            library.downloads.classifiers![formattedNativeIndex]!,
                            <Name>os,
                            `x${arch}`,
                        );
                    });
                } else {
                    return resolveNative(library.downloads.classifiers![nativeIndex]!, <Name>os);
                }
            })
            .flat();
    }

    #resolveLibrary(library: Library): ProfileLibrary {
        const { path, sha1 } = library.downloads.artifact!;
        return { path, sha1, type: "library", rules: library.rules };
    }

    #resolveRulesForNatives(library: Library) {
        if (!library.rules) {
            return Object.entries(library.natives!);
        }

        let res: [string, keyof Classifiers][] = [];
        library.rules.forEach((rule) => {
            if (rule.action === Action.Allow) {
                if (rule.os) {
                    res.push([rule.os.name, library.natives![rule.os.name]!]);
                } else {
                    res.push(...Object.entries(library.natives!));
                }
            } else {
                res = res.filter(([os]) => os !== rule.os!.name);
            }
        });
        return res;
    }

    async #getVersions() {
        try {
            return await HttpHelper.getResourceFromJson<VersionsManifest>(
                this.#versionManifestLink,
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.info.errVerParsing,
            );
            return;
        }
    }

    protected async getVersionInfo(gameVersion: string) {
        const versionInfo = await this.#getVersions();
        if (!versionInfo) return;

        const version = versionInfo.versions.find(({ id }) => id === gameVersion);

        if (!version) {
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.info.verNotFound,
                gameVersion,
            );
        }

        try {
            return await HttpHelper.getResourceFromJson<VersionProfile>(version.url);
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.info.errClientParsing,
            );
        }
    }
}
