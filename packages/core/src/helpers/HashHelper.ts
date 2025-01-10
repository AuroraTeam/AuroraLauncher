import { BinaryLike, createHash } from "crypto"
import { readFile } from "fs/promises"

export class HashHelper {
    /**
     * Получить хеш данных
     * @param data Данные
     * @param type Тип хеша
     * @returns Хеш данных
     */
    static getHash(data: BinaryLike, type: string) {
        return createHash(type).update(data).digest("hex")
    }

    /**
     * Получить хеш файла
     * @param path Путь до файла
     * @param type Тип хеша
     * @returns Хеш файла
     */
    static async getHashFromFile(path: string, type: string) {
        return this.getHash(await readFile(path), type)
    }

    /**
     * Сверить хеш файла с предоставленным хешем
     * @param path Путь до файла
     * @param type Тип хеша
     * @param fileHash Хеш файла
     * @returns `true` в случае совпадения, `false` в противном случае
     */
    static async compareFileHash(path: string, type: string, fileHash: string) {
        return (await this.getHashFromFile(path, type)) === fileHash
    }
}
