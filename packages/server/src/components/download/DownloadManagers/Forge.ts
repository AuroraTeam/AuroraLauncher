import { spawnSync } from "child_process";
import { createHash } from "crypto";
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs";
import { extname, resolve } from "path";

import { JsonHelper, ProfileLibrary, ZipHelper } from "@aurora-launcher/core";
import { LogHelper, StorageHelper } from "@root/utils";
import semver from "semver";
import { Service } from "typedi";

import { InstallProfile, Libraries, VersionProfiles } from "../interfaces/IForge";
import { MojangManager } from "./Mojang";

@Service()
export class ForgeManager extends MojangManager {
    #forgeInstall = readdirSync(StorageHelper.storageDir)
        .filter((s) => s.includes("forge") && extname(s) === ".jar")[0]
        ?.toString();
    #tempDir = StorageHelper.getTmpPath();

    async downloadClient(gameVersion: string, clientName: string) {
        if (this.checkFileInstaller(gameVersion)) {
            const profileUUID = await super.downloadClient(gameVersion, clientName);
            if (!profileUUID) return;

            LogHelper.info(
                this.langManager.getTranslate.DownloadManager.ForgeManager.client.install,
            );
            this.startInstallerFile();

            const versionProfiles: VersionProfiles = JsonHelper.fromJson(
                readFileSync(resolve(this.#tempDir, "version.json")).toString(),
            );
            const lib = this.libParser(versionProfiles.libraries, gameVersion);
            this.libCopy(lib);
            const mojangProfile = this.profilesManager
                .getProfiles()
                .filter((p) => p.uuid == profileUUID);
            const finalLib = this.fixLog4j(mojangProfile[0].libraries, lib);

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

    checkFileInstaller(gameVersion: string): boolean {
        if (this.#forgeInstall) {
            mkdirSync(this.#tempDir);
            cpSync(
                resolve(StorageHelper.storageDir, this.#forgeInstall),
                resolve(this.#tempDir, this.#forgeInstall),
            );
            ZipHelper.unzip(resolve(this.#tempDir, this.#forgeInstall), this.#tempDir);
            const install_profile: InstallProfile = JsonHelper.fromJson(
                readFileSync(resolve(this.#tempDir, "install_profile.json")).toString(),
            );
            if (install_profile.profile == "forge" && install_profile.minecraft == gameVersion)
                return true;
        } else {
            return false;
        }
    }

    startInstallerFile() {
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
        const installerProcess = spawnSync(
            "java",
            ["-jar", resolve(this.#tempDir, this.#forgeInstall), "--installClient", this.#tempDir],
            { stdio: "ignore" },
        );
        if (installerProcess.error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.ForgeManager.info.notFoundJava,
            );
            LogHelper.debug(installerProcess.error);
        }
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

        if (semver.gte(version, "1.13.1")) {
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
