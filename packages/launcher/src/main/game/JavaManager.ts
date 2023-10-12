import { join } from 'path';
import { StorageHelper } from '../helpers/StorageHelper';
import { existsSync } from 'fs';
import { Service } from 'typedi';
import { HttpHelper, ZipHelper } from '@aurora-launcher/core';
import tar from 'tar';
import { mkdir, rename, rmdir } from 'fs/promises';

@Service()
export class JavaManager {
    async checkAndDownloadJava(majorVersion: number) {
        const javaDir = this.#getJavaDir(majorVersion);

        if (existsSync(javaDir)) {
            return true;
        }

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
            javaData.binary.package.link
                .replace('{version}', majorVersion.toString())
                .replace('{os}', this.#getOs())
                .replace('{arch}', this.#getArch()),
            null,
            {
                saveToTempFile: true,
            },
        );

        if (process.platform === 'win32') {
            ZipHelper.unzip(javaFile, javaDir);
        } else {
            await mkdir(javaDir);
            await tar.x({
                file: javaFile,
                cwd: javaDir,
            });
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
        if (process.platform === 'darwin') {
            return join(
                this.#getJavaDir(majorVersion),
                'Contents',
                'Home',
                'bin',
                'java',
            );
        } else {
            return join(this.#getJavaDir(majorVersion), 'bin', 'java');
        }
    }

    #getJavaDir(majorVersion: number) {
        return join(StorageHelper.javaDir, majorVersion.toString());
    }

    #getOs() {
        switch (process.platform) {
            case 'win32':
                return 'windows';
            case 'darwin':
                return 'mac';
            default:
                // Linux and others
                return process.platform;
        }
    }

    #getArch() {
        switch (process.arch) {
            case 'ia32':
                return 'x86';
            case 'arm64':
                return 'aarch64';
            default:
                // x64 and others
                return process.arch;
        }
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
