import { parse, stringify } from "hjson";

export type HjsonData = Record<string, any> | any[];

/**
 * Класс хелпер для работы с Hjson
 */
export class HjsonHelper {
    /**
     * Преобразовать Hjson строку в объект / массив
     * @param string Hjson строка
     * @returns `Object | Array`
     */
    static fromHjson<T extends HjsonCommented>(string: string): T {
        return parse(string, { keepWsc: true });
    }

    /**
     * Преобразовать объект / массив в Hjson строку
     * @param data Пробразуемый объект / массив
     * @returns Hjson сторка
     */
    static toHjson(data: HjsonData): string {
        return stringify(data, { keepWsc: true, space: 4 });
    }

    static defineComments(from: HjsonCommented, to: HjsonCommented) {
        Object.defineProperty(to, "__COMMENTS__", {
            enumerable: false,
            value: from.__COMMENTS__,
        });
    }
}

export abstract class HjsonCommented {
    __COMMENTS__?: any;
}
