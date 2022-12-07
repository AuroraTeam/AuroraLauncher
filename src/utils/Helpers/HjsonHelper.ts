import { parse, stringify } from "hjson"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HjsonData = Record<string, any> | any[]

/**
 * Класс хелпер для работы с Hjson
 */
export class HjsonHelper {
    /**
     * Преобразовать Hjson строку в объект / массив
     * @param string Hjson строка
     * @returns `Object | Array`
     */
    static fromHjson<T>(string: string): T {
        return parse(string, { keepWsc: true })
    }

    /**
     * Преобразовать объект / массив в Hjson строку
     * @param object Пробразуемый объект / массив
     * @returns Hjson сторка
     */
    static toHjson(object: HjsonData): string {
        return stringify(object, { keepWsc: true })
    }
}
