import * as http from "http"

import { HttpHelper as CoreHttpHelper } from "@auroralauncher/core"
import getRawBody from "raw-body"

import { JsonHelper } from "./JsonHelper"

export class HttpHelper extends CoreHttpHelper {
    // TODO Проработать этот момент
    public static isEmptyQuery(query: URLSearchParams): boolean {
        return query.toString().length === 0
    }

    public static parseQuery(url: string): URLSearchParams {
        return new URLSearchParams(url.split("?")[1])
    }

    public static sendError(res: http.ServerResponse, code = 400, error?: string, errorMessage?: string): void {
        res.statusCode = code
        this.sendJson(res, { error, errorMessage })
    }

    public static sendJson(res: http.ServerResponse, data: object): void {
        res.setHeader("Content-Type", "application/json; charset=utf-8")
        res.end(JsonHelper.toJSON(data))
    }

    public static isJsonPostData(req: http.IncomingMessage): boolean {
        return !!req.headers["content-type"] || req.headers["content-type"].includes("application/json")
    }

    /**
     * @returns Объект в случае успеха, иначе ошибку парсинга функции getRawBody
     * @throws Выбрасывает объект ошибки в случае ошибки парсинга
     */
    public static async parsePostData(req: http.IncomingMessage): Promise<string> {
        return await getRawBody(req, { limit: "500kb", encoding: "utf-8" })
    }
}
