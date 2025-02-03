import { resolve, extname } from "path";
import { mkdirSync, cpSync, rmSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { spawnSync } from 'child_process';
import { createHash } from "crypto";

import { ZipHelper, JsonHelper, ProfileLibrary, HttpHelper } from "@aurora-launcher/core";
import { LogHelper, StorageHelper } from "@root/utils";
import { Service } from "typedi";

import { MojangManager } from "./Mojang";
import { InstallProfile, VersionProfiles, Libraries, NeoManifest } from "../interfaces/IForge";

@Service()
export class NeoForgeManager extends MojangManager {
    #forgeInstall = ""
    #tempDir = StorageHelper.getTmpPath()

    async downloadClient(gameVersion: string, clientName: string) {
        if (await this.downloadForge(gameVersion)) {
            const profileUUID = await super.downloadClient(gameVersion, clientName)
            if (!profileUUID) return
            
            LogHelper.info(this.langManager.getTranslate.DownloadManager.ForgeManager.client.install)
            this.startInstallerFile()

            const versionProfiles:VersionProfiles = JsonHelper.fromJson(readFileSync(resolve(this.#tempDir, 'version.json')).toString())
            const lib = this.libParser(versionProfiles.libraries)
            this.libCopy(lib)
            this.profilesManager.editProfile(profileUUID, (profile) => ({
                mainClass: versionProfiles.mainClass,
                libraries: [...profile.libraries, ...lib],
                jvmArgs: versionProfiles.arguments.jvm,
                clientArgs: versionProfiles.arguments.game,
            }));
            rmSync(this.#tempDir, { recursive: true })
            LogHelper.info(this.langManager.getTranslate.DownloadManager.MirrorManager.client.success);
        }
        else LogHelper.error(this.langManager.getTranslate.DownloadManager.NeoforgeManager.info.errForgeVersion);
    }

    async downloadForge(gameVersion: string) {
        try {
            const manifest = await HttpHelper.getResourceFromJson<NeoManifest>(
                `https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge?filter=${gameVersion.slice(2)}`,
            );
            mkdirSync(this.#tempDir);
            const file = await HttpHelper.downloadFile(
                `https://maven.neoforged.net/releases/net/neoforged/neoforge/${manifest.version}/neoforge-${manifest.version}-installer.jar`, 
                resolve(this.#tempDir, `neoforge-${manifest.version}-installer.jar`),
            );
            if (!file) {
                return false;
            }
            this.#forgeInstall = file
            await ZipHelper.unzip(resolve(this.#tempDir, this.#forgeInstall), this.#tempDir);
            return true;
        } catch {
            return false;
        }
    }

    startInstallerFile() {
        const launcherProfiles = JsonHelper.toJson({
            "selectedProfile": "(Default)",
            "profiles": {
              "(Default)": {
                "name": "(Default)"
              }
            },
            "clientToken": ""
        })
        writeFileSync(resolve(this.#tempDir, 'launcher_profiles.json'), launcherProfiles)
        const installerProcess = spawnSync('java', ['-jar', resolve(this.#tempDir, this.#forgeInstall), '--installClient', this.#tempDir], {stdio: 'ignore'})
        if (installerProcess.error) {
            LogHelper.error(this.langManager.getTranslate.DownloadManager.ForgeManager.info.notFoundJava)
            LogHelper.debug(installerProcess.error)
        }
    }

    libParser(libraries: Array<Libraries>): Array<ProfileLibrary> {
        const list:ProfileLibrary[] = []
        for (const lib of libraries) {
            const name = lib.name.split(':')[1]
            if (name.search(/log4j|slf4j|failureaccess|jopt-simple/) == -1){
                list.unshift({path: lib.downloads.artifact.path, sha1: lib.downloads.artifact.sha1, type: 'library'})
            }
        }

        const install_profile: InstallProfile = JsonHelper.fromJson(readFileSync(resolve(this.#tempDir, 'install_profile.json')).toString())
        for (const lib of install_profile.libraries) {
            const name = lib.name.split(':')[1]
            if (name == 'neoforge') {
                list.unshift({path: lib.downloads.artifact.path, sha1: lib.downloads.artifact.sha1, type: 'library'})
                const forgeClientPath = lib.downloads.artifact.path.replaceAll('universal', 'client')
                const forgeClientSha1 = createHash('sha1').update(readFileSync(resolve(this.#tempDir, 'libraries', forgeClientPath))).digest("hex")
                list.unshift({path: forgeClientPath, sha1: forgeClientSha1, type: 'library'})
            }
        }

        const minecraftDir = readdirSync(resolve(this.#tempDir, 'libraries/net/minecraft/client'))[0]
        const files = readdirSync(resolve(this.#tempDir, 'libraries/net/minecraft/client', minecraftDir)).filter(s => extname(s) === '.jar')
        for (const file of files) {
            list.unshift({
                path: `net/minecraft/client/${minecraftDir}/${file}`,
                sha1: createHash('sha1').update(readFileSync(resolve(this.#tempDir, 'libraries/net/minecraft/client', minecraftDir, file))).digest("hex"),
                type: 'library',
                ignoreClassPath: true
                
            })
        }

        return list
    }
    
    libCopy(libraries: Array<ProfileLibrary>) {
        for (const lib of libraries) {
            cpSync(resolve(this.#tempDir, 'libraries', lib.path), resolve(StorageHelper.librariesDir, lib.path))
        }
    }
}