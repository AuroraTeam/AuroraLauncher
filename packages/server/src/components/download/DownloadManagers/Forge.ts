import { spawn } from "child_process";
import { createHash } from "crypto";
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs";
import { extname, resolve } from "path";

import { HttpHelper, JsonHelper, ProfileLibrary, ZipHelper } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { LogHelper, StorageHelper } from "@root/helpers";
import { coerce, gte, lt } from "semver";

import { InstallProfile, Libraries, Manifest, VersionProfiles } from "../interfaces/IForge";
import { MojangManager } from "./Mojang";

@Service([])
export class ForgeManager extends MojangManager {
    #forgeInstall = "";
    #tempDir = StorageHelper.getTmpPath();

    override async downloadClient(gameVersion: string, clientName: string) {
        if (lt(coerce(gameVersion)!.version, "1.12.2")) {
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.ForgeManager.info.supportError,
            );
        }

        if (await this.downloadForge(gameVersion)) {
            const profileUUID = await super.downloadClient(gameVersion, clientName);
            if (!profileUUID) return;

            LogHelper.info(
                this.langManager.getTranslate.DownloadManager.ForgeManager.client.install,
            );
            await this.startInstallerFile();

            const versionProfiles: VersionProfiles = JsonHelper.fromJson(
                readFileSync(resolve(this.#tempDir, "version.json")).toString(),
            );
            const lib = this.libParser(versionProfiles.libraries, gameVersion);
            this.libCopy(lib);
            const mojangProfile = this.profilesManager
                .getProfiles()
                .find((p) => p.uuid == profileUUID);
            const finalLib = this.fixLog4j(mojangProfile.libraries, lib);

            let jvm = Array<string>();
            let game = Array<string>();
            if (!versionProfiles.arguments) {
                jvm = [];
                game = [
                    "--tweakClass",
                    "net.minecraftforge.fml.common.launcher.FMLTweaker",
                    "--versionType",
                    "Forge",
                ];
            } else {
                jvm = versionProfiles.arguments.jvm;
                game = versionProfiles.arguments.game;
            }
            this.profilesManager.editProfile(profileUUID, () => ({
                mainClass: versionProfiles.mainClass,
                libraries: finalLib,
                jvmArgs: jvm,
                clientArgs: game,
            }));
            rmSync(this.#tempDir, { recursive: true });
            LogHelper.info(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.success,
            );
        } else
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.ForgeManager.info.errForgeVersion,
            );
    }

    async downloadForge(gameVersion: string) {
        try {
            const manifest = await HttpHelper.getResourceFromJson<Manifest>(
                "https://api.curseforge.com/v1/minecraft/modloader",
            );
            const dataInstaller = manifest.data.filter(
                (link) => link.gameVersion === gameVersion && link.latest,
            )[0];
            const forgeVersion = dataInstaller.name.slice(6);
            mkdirSync(this.#tempDir);
            const file = await HttpHelper.downloadFile(
                `https://maven.minecraftforge.net/net/minecraftforge/forge/${gameVersion}-${forgeVersion}/forge-${gameVersion}-${forgeVersion}-installer.jar`,
                resolve(this.#tempDir, `forge-${gameVersion}-${forgeVersion}-installer.jar`),
            );
            if (!file) {
                return false;
            }
            this.#forgeInstall = file;
            await ZipHelper.unzip(resolve(this.#tempDir, this.#forgeInstall), this.#tempDir);
            return true;
        } catch (error) {
            LogHelper.debug(error);
            return false;
        }
    }

    async startInstallerFile() {
        const launcherProfiles = JsonHelper.toJson({
            selectedProfile: "(Default)",
            profiles: {
                "(Default)": {
                    name: "(Default)",
                },
            },
            clientToken: "",
        });
        writeFileSync(resolve(this.#tempDir, "launcher_profiles.json"), launcherProfiles);

        const installerProcess = spawn("java", [
            "-jar",
            resolve(this.#tempDir, this.#forgeInstall),
            "--installClient",
            this.#tempDir,
        ]);
        installerProcess.stdout.on("data", (data: Buffer) => {
            LogHelper.debug(data.toString().trimEnd());
        });
        installerProcess.stderr.on("error", (data: Buffer) => {
            LogHelper.error(data.toString().trimEnd());
        });

        await new Promise((resolve, reject) => {
            installerProcess.on("close", (code) => {
                if (code != 0) {
                    LogHelper.error(
                        this.langManager.getTranslate.DownloadManager.ForgeManager.info
                            .notFoundJava,
                    );
                    reject();
                }
                resolve(true);
            });
        });
    }

    libParser(libraries: Array<Libraries>, version: string): Array<ProfileLibrary> {
        const list: ProfileLibrary[] = [];
        for (const lib of libraries) {
            list.push({
                path: lib.downloads.artifact.path,
                sha1: lib.downloads.artifact.sha1,
                type: "library",
            });
        }

        const install_profile: InstallProfile = JsonHelper.fromJson(
            readFileSync(resolve(this.#tempDir, "install_profile.json")).toString(),
        );
        for (const lib of install_profile.libraries) {
            const name = lib.name.split(":")[1];
            if (
                name == "fmlcore" ||
                name == "javafmllanguage" ||
                name == "lowcodelanguage" ||
                name == "mclanguage"
            ) {
                list.push({
                    path: lib.downloads.artifact.path,
                    sha1: lib.downloads.artifact.sha1,
                    type: "library",
                });
            }
            if (name == "forge") {
                list.push({
                    path: lib.downloads.artifact.path,
                    sha1: lib.downloads.artifact.sha1,
                    type: "library",
                });
                const forgeClientPath = lib.downloads.artifact.path.replaceAll(
                    "universal",
                    "client",
                );
                const forgeClientSha1 = createHash("sha1")
                    .update(readFileSync(resolve(this.#tempDir, "libraries", forgeClientPath)))
                    .digest("hex");
                list.push({ path: forgeClientPath, sha1: forgeClientSha1, type: "library" });
            }
        }

        if (gte(version, "1.13.1")) {
            for (const clientDir of readdirSync(
                resolve(this.#tempDir, "libraries/net/minecraft/client"),
            )) {
                for (const file of readdirSync(
                    resolve(this.#tempDir, "libraries/net/minecraft/client", clientDir),
                ).filter((s) => extname(s) === ".jar")) {
                    list.push({
                        path: `net/minecraft/client/${clientDir}/${file}`,
                        sha1: createHash("sha1")
                            .update(
                                readFileSync(
                                    resolve(
                                        this.#tempDir,
                                        "libraries/net/minecraft/client",
                                        clientDir,
                                        file,
                                    ),
                                ),
                            )
                            .digest("hex"),
                        type: "library",
                        ignoreClassPath: true,
                    });
                }
            }
        }

        return list;
    }

    libCopy(libraries: Array<ProfileLibrary>) {
        for (const lib of libraries) {
            cpSync(
                resolve(this.#tempDir, "libraries", lib.path),
                resolve(StorageHelper.librariesDir, lib.path),
            );
        }
    }

    fixLog4j(Mlib: Array<ProfileLibrary>, lib: Array<ProfileLibrary>) {
        const index1 = Mlib.findIndex((x) => x.path.includes("log4j-api"));
        const index2 = Mlib.findIndex((x) => x.path.includes("log4j-core"));
        const newIndex1 = lib.findIndex((x) => x.path.includes("log4j-api"));
        const newIndex2 = lib.findIndex((x) => x.path.includes("log4j-core"));
        if (newIndex1 !== -1 || newIndex2 !== -1) {
            Mlib.splice(index1, 1, lib[newIndex1]);
            Mlib.splice(index2, 1, lib[newIndex2]);
            lib.splice(newIndex1, 1);
            lib.splice(newIndex2, 1);
        }
        return Mlib.concat(lib);
    }
}
