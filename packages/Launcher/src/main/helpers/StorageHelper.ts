import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export class StorageHelper {
    // static storageDir: string = (process.env.DEV || false) ? __dirname : resolve(__dirname, '../game')
    static storageDir: string = __dirname;
    static assetsDir: string = resolve(StorageHelper.storageDir, 'assets');
    static clientsDir: string = resolve(StorageHelper.storageDir, 'clients');
    static librariesDir: string = resolve(
        StorageHelper.storageDir,
        'libraries'
    );
    static logFile: string = resolve(StorageHelper.storageDir, 'Launcher.log');

    static createMissing(): void {
        if (!existsSync(this.assetsDir)) mkdirSync(this.assetsDir);
        if (!existsSync(this.clientsDir)) mkdirSync(this.clientsDir);
        if (!existsSync(this.librariesDir)) mkdirSync(this.librariesDir);
    }
}
