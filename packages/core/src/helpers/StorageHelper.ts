import { randomBytes } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { resolve } from "path";

export class StorageHelper {
    /**
     * Генерирует путь к времененной папке / файлу во временной деректории операционной системы
     * @returns Путь к времененной папке / файлу
     * @example `/tmp/962f2250ed89c7c013e4b442dcd620a5` или `C:\\Users\\user\\AppData\\Local\\Temp\\d32e9f17ca638349326f9fa7228a7920`
     */
    static getTmpPath() {
        return resolve(tmpdir(), randomBytes(16).toString("hex"));
    }

    /**
     * Получить или создать папку
     * @param path Путь к папке
     */
    static getOrCreateDir(path: string) {
        if (!existsSync(path)) mkdirSync(path, { recursive: true });
    }

    /**
     * Получить нормализованный путь до папки и создать её в случае отсутствия
     * @param paths Последовательность сегментов пути
     * @returns Нормализованный путь до папки
     */
    static resolveDir(...paths: string[]) {
        const path = resolve(...paths);
        this.getOrCreateDir(path);
        return path;
    }
}
