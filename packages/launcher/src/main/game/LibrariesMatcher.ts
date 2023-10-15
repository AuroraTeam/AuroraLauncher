import { Action, LibraryRule, Name } from '@aurora-launcher/core';
import { Architecture, Platform } from '../core/System';

export class LibrariesMatcher {
    static match(rules?: LibraryRule[]) {
        if (!rules || rules.length === 0) return true;

        let result;

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

    private static isMatchedOs(os: Name) {
        return os ? this.mapOsToPlatform(os) === process.platform : true;
    }

    private static isMatchedArch(arch?: string) {
        // Не нашёл используется ли это где-то, но пожалуй оставлю, всё равно работает
        return arch ? this.mapArch(arch) === process.arch : true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private static isMatchedVersion(version?: string) {
        // эта тема встречается только на старых версиях (например на 1.6.4) с macOS
        // поэтому думаю мы с этим даже не столкнёмся, но на всякий случай оставлю этот обработчик
        return true;
    }

    private static mapOsToPlatform(os: Name) {
        const osToPlatform = {
            [Name.Osx]: Platform.MACOS,
            [Name.Linux]: Platform.LINUX,
            [Name.Windows]: Platform.WINDOWS,
        };
        return osToPlatform[os];
    }

    private static mapArch(arch: string) {
        if (['x32', 'x86'].includes(arch)) {
            return Architecture.X32;
        }
        return arch;
    }
}
