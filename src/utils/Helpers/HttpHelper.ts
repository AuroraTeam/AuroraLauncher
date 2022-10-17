import http from "http"

import { HttpHelper as CoreHttpHelper } from "@auroralauncher/core"

/**
 * HttpClient Helper
 * Бля ору, говнокод, надо вырезать отсюда серверные функции
 */
export class HttpHelper extends CoreHttpHelper {
    /**
     * It takes a URL, and returns a promise that resolves to a generic type
     * @param {URL} url - URL - The URL of the resource to get
     * @returns A promise of type T
     * @deprecated use `HttpHelper.getResourceFromJson()`
     */
    public static getJson<T>(url: URL): Promise<T> {
        return this.getResourceFromJson(url)
    }
}
