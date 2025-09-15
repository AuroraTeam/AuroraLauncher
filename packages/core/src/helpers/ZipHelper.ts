import { HashHelper } from "./HashHelper";
import { mkdir } from "fs/promises";
import StreamZip from "node-stream-zip";
import { dirname, extname, join } from "path";

export class ZipHelper {
    /**
     * Распаковка архива в папку
     * @param archive - путь до архива
     * @param destDir - конечная папка
     * @param whitelist - распаковать файлы с определённым расширением (указывать с точкой, например: .so)
     * @param onProgress - функция для отслеживания прогресса распаковки
     * @returns список распакованных файлов
     */
    static async unzip(
        archive: string,
        destDir: string,
        whitelist: string[] = [],
        onProgress?: (size: number) => void,
    ): Promise<{ path: string; sha1: string }[]> {
        // Открываем ZIP архив в асинхронном режиме
        const zip = new StreamZip.async({ file: archive });
        const extractedFiles: { path: string; sha1: string }[] = [];

        try {
            // Получаем список всех записей в архиве
            const entries = await zip.entries();
            // Проходим по записям (ключами является имя файла в архиве)
            for (const entry of Object.values(entries)) {
                // Пропускаем директории
                if (entry.isDirectory) continue;
                // Если задан whitelist и расширение файла не включено в него, пропускаем
                if (whitelist.length > 0 && !whitelist.includes(extname(entry.name))) {
                    continue;
                }

                // Вызываем функцию обратного вызова для отслеживания прогресса
                if (onProgress) {
                    onProgress(entry.compressedSize);
                }

                // Получаем данные записи
                const data = await zip.entryData(entry);
                const sha1 = HashHelper.getHash(data, "sha1");
                extractedFiles.push({
                    path: entry.name,
                    sha1,
                });
                // Определяем полный путь для сохранения файла
                const filePath = join(destDir, entry.name);
                const fileDir = dirname(filePath);

                // Гарантируем, что каталог существует
                await mkdir(fileDir, { recursive: true });
                // Извлекаем файл
                await zip.extract(entry, filePath);
            }
        } finally {
            // Не забудьте закрыть архив для освобождения ресурсов
            await zip.close();
        }
        return extractedFiles;
    }
}
