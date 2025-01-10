export type JsonData = unknown

/**
 * Класс хелпер для работы с JSON
 */
export class JsonHelper {
    /**
     * Преобразовать JSON строку в объект / массив
     * @param string JSON строка
     * @returns `Object | Array`
     */
    static fromJson<T>(string: string): T {
        return JSON.parse(string)
    }

    /**
     * Преобразовать объект / массив в JSON строку
     * @param object Пробразуемый объект / массив
     * @param pretty Форматировать вывод отступами или вывести в одну строку (по умолчанию `false`)
     * @returns JSON сторка
     */
    static toJson(object: JsonData, pretty = false): string {
        return pretty ? JSON.stringify(object, null, 4) : JSON.stringify(object)
    }
}
