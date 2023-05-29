import { randomBytes } from "crypto"
import { tmpdir } from "os"
import { resolve } from "path"

export class StorageHelper {
    /**
     * Генерирует путь к времененной папке / файлу во временной деректории операционной системы
     * @returns Путь к времененной папке / файлу
     * @example `/tmp/962f2250ed89c7c013e4b442dcd620a5` или `C:\\Users\\user\\AppData\\Local\\Temp\\d32e9f17ca638349326f9fa7228a7920`
     */
    static getTmpPath() {
        return resolve(tmpdir(), randomBytes(16).toString("hex"))
    }
}
