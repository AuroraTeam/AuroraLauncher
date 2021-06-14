/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "../../../helpers/JsonHelper"

export abstract class AbstractRequest {
    abstract readonly url: RegExp
    abstract readonly method: string

    abstract emit(req: IncomingMessage, res: ServerResponse): PromiseOr<void>

    protected parseQuery(url: string): URLSearchParams {
        return new URLSearchParams(url.split("?")[1])
    }

    protected isEmptyQuery(query: URLSearchParams): boolean {
        return query.toString().length === 0
    }

    protected returnError(error: string, errorMessage?: string): string {
        return JsonHelper.toJSON({ error, errorMessage })
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected isInvalidValue(param: any): boolean {
        return typeof param !== "string" || param.trim().length === 0
    }

    protected getPostData(req: IncomingMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            let data = ""
            req.on("data", (chunk) => {
                data += chunk
            })
            req.on("end", () => {
                resolve(data)
            })
            req.on("error", (error) => {
                reject(error)
            })
        })
    }
}
