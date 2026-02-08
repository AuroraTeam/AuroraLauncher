import { parse } from "@hapi/bourne";

export type JsonData = unknown;

/**
 * Класс хелпер для работы с JSON
 */
export class JsonHelper {
    /**
     * Преобразовать JSON строку в объект / массив
     * @param string JSON строка
     * @returns `Object | Array`
     */
    static parse<T>(string: string): T {
        return <T>parse(string);
    }

    /**
     * Преобразовать объект / массив в JSON строку
     * @param object Преобразуемый объект / массив
     * @param pretty Форматировать вывод отступами или вывести в одну строку (по умолчанию `false`)
     * @returns JSON строка
     */
    static stringify(object: JsonData, pretty = false): string {
        return JSON.stringify(object, null, pretty ? 4 : 0);
    }
}
