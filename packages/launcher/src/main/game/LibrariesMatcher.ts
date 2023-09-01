import { Action, LibraryRule, Name } from '@aurora-launcher/core';

export class LibrariesMatcher {
    static match(rules?: LibraryRule[]) {
        if (!rules) return true;

        let result;

        // Вот это пожалуй стоит покрыть тестами
        rules.forEach((rule) => {
            if (rule.action === Action.Allow) {
                result = true;
                if (rule.os) {
                    result =
                        this.isMatchedOs(rule.os.name) &&
                        this.isMatchedArch(rule.os.arch) &&
                        this.isMatchedVersion(rule.os.version);
                }
            } else {
                // Disallow
                result = false;
                if (rule.os) {
                    result =
                        !this.isMatchedOs(rule.os.name) ||
                        !this.isMatchedArch(rule.os.arch) ||
                        !this.isMatchedVersion(rule.os.version);
                }
            }
        });

        return result;
    }

    private static isMatchedOs(os: string) {
        return this.mapOsToPlatform(os) === process.platform;
    }

    private static isMatchedArch(arch?: string) {
        return arch ? this.mapArch(arch) === process.arch : true;
    }

    private static isMatchedVersion(version?: string) {
        // TODO: add support version comparison
        return true;
    }

    private static mapOsToPlatform(os: string) {
        switch (os) {
            case Name.Osx:
                return 'darwin';
            case Name.Windows:
                return 'win32';
            case Name.Linux:
                return 'linux';
            default:
                return os;
        }
    }

    private static mapArch(arch: string) {
        switch (arch) {
            case 'x64':
                return 'x64';
            case 'x32':
            case 'x86':
                return 'ia32';
            default:
                return arch;
        }
        // TODO: add support for other archs
    }
}
