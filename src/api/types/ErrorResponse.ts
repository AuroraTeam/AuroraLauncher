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

/**
 * ResponseError
 */
export class ResponseError extends Error {
    private code: number

    constructor(code?: number, message?: string) {
        super(message || "Unknown response error")
        this.code = code || 100
        this.name = this.constructor.name
    }

    toJSON(): ErrorResponse {
        return {
            code: this.code,
            message: this.message,
        }
    }
}

export interface ErrorResponse {
    code: number
    message: string
}

export interface wsErrorResponse extends ErrorResponse {
    uuid: string
}
