import { join } from 'path';
import { StorageHelper } from '../helpers/StorageHelper';
import { existsSync } from 'fs';
import { Service } from 'typedi';
import { HttpHelper, ZipHelper } from '@aurora-launcher/core';
import tar from 'tar';
import { mkdir, rename, rmdir } from 'fs/promises';
import { Architecture, Platform } from '../core/System';

@Service()
export class JavaManager {
    async checkAndDownloadJava(majorVersion: number) {
        const javaDir = this.#getJavaDir(majorVersion);
        if (existsSync(javaDir)) return true;

        const javaDataLink =
            'https://api.adoptium.net/v3/assets/latest/{version}/hotspot?architecture={arch}&image_type=jre&os={os}&vendor=eclipse';

        const javaData = (
            await HttpHelper.getResourceFromJson<JavaData[]>(
                javaDataLink
                    .replace('{version}', majorVersion.toString())
                    .replace('{os}', this.#getOs())
                    .replace('{arch}', this.#getArch()),
            )
        )[0];

        const javaFile = await HttpHelper.downloadFile(
            javaData.binary.package.link,
            null,
            { saveToTempFile: true },
        );

        if (process.platform === Platform.WINDOWS) {
            ZipHelper.unzip(javaFile, javaDir);
        } else {
            await mkdir(javaDir, { recursive: true });
            await tar.x({ file: javaFile, cwd: javaDir });
        }

        // windows moment
        await rename(
            join(javaDir, `${javaData.release_name}-jre`),
            `${javaDir}-tmp`,
        );
        await rmdir(javaDir);
        await rename(`${javaDir}-tmp`, javaDir);
    }

    getJavaPath(majorVersion: number) {
        const path = ['bin', 'java'];
        if (process.platform === Platform.MACOS) {
            path.unshift('Contents', 'Home');
        }
        return join(this.#getJavaDir(majorVersion), ...path);
    }

    #getJavaDir(majorVersion: number) {
        return join(StorageHelper.javaDir, majorVersion.toString());
    }

    #getOs() {
        const PlatformToJavaOS = {
            [Platform.WINDOWS]: JavaOs.WINDOWS,
            [Platform.MACOS]: JavaOs.MAC,
            [Platform.LINUX]: JavaOs.LINUX,
        };
        return PlatformToJavaOS[<Platform>process.platform] || process.platform;
    }

    #getArch() {
        const ArchitectureToJavaOS = {
            [Architecture.X32]: JavaArchitecture.X32,
            [Architecture.X64]: JavaArchitecture.X64,
            [Architecture.ARM]: JavaArchitecture.ARM,
            [Architecture.ARM64]: JavaArchitecture.ARM64,
        };
        return ArchitectureToJavaOS[<Architecture>process.arch] || process.arch;
    }
}

export interface JavaData {
    binary: Binary;
    release_name: string;
}

export interface Binary {
    package: Package;
}

export interface Package {
    checksum: string;
    checksum_link: string;
    download_count: number;
    link: string;
    metadata_link: string;
    name: string;
    signature_link: string;
    size: number;
}

export enum JavaOs {
    WINDOWS = 'windows',
    MAC = 'mac',
    LINUX = 'linux',
}

export enum JavaArchitecture {
    ARM = 'arm',
    ARM64 = 'aarch64',
    X32 = 'x86',
    X64 = 'x64',
}
