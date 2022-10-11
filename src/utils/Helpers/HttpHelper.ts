import http from "http"

import { HttpHelper as CoreHttpHelper } from "@auroralauncher/core"
import getRawBody from "raw-body"

import { JsonHelper } from "./JsonHelper"

/**
 * HttpClient Helper
 * Бля ору, говнокод, надо вырезать отсюда серверные функции
 */
export class HttpHelper extends CoreHttpHelper {
    // TODO Проработать этот момент
    public static isEmptyQuery(query: URLSearchParams): boolean {
        return query.toString().length === 0
    }

    /**
     * It takes a URL string, splits it at the question mark, and returns the second half of the string
     * as a URLSearchParams object
     * @param {string} url - The URL to parse.
     * @returns A new URLSearchParams object
     */
    public static parseQuery(url: string): URLSearchParams {
        return new URLSearchParams(url.split("?")[1])
    }

    /**
     * It sends an error message to the client.
     * @param res - http.ServerResponse - The response object that will be sent back to the client.
     * @param [code=400] - The HTTP status code to send.
     * @param {string} [error] - The error code.
     * @param {string} [errorMessage] - The message that will be displayed to the user.
     */
    public static sendError(
        res: http.ServerResponse,
        code = 400,
        error?: string,
        errorMessage?: string
    ): void {
        res.statusCode = code
        this.sendJson(res, { error, errorMessage })
    }

    /**
     * It sends a JSON response to the client
     * @param res - http.ServerResponse - The response object that is passed to the request handler.
     * @param {object} data - The data to be sent.
     */
    public static sendJson(res: http.ServerResponse, data: object): void {
        res.setHeader("Content-Type", "application/json; charset=utf-8")
        res.end(JsonHelper.toJson(data))
    }

    /**
     * It returns true if the request has a content-type header and it includes the string
     * "application/json"
     * @param req - http.IncomingMessage
     * @returns A boolean value.
     */
    public static isJsonPostData(req: http.IncomingMessage): boolean {
        return (
            !!req.headers["content-type"] ||
            req.headers["content-type"].includes("application/json")
        )
    }

    /**
     * It takes an incoming request, and returns a promise that resolves to the request body as a
     * string
     * @param req - http.IncomingMessage
     * @returns A promise that resolves to a string.
     */
    public static async parsePostData(
        req: http.IncomingMessage
    ): Promise<string> {
        return await getRawBody(req, { limit: "500kb", encoding: "utf-8" })
    }

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
