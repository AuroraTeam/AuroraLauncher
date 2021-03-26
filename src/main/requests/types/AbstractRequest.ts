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

export abstract class AbstractRequest {
    protected type: string

    getType(): string {
        return this.type
    }

    abstract invoke(data: wsRequest): wsResponseWithoutUUID | wsErrorResponseWithoutUUID
}

export interface wsRequest {
    type: string
    uuid: uuidv4
    data: object
}

export interface wsResponse {
    uuid: uuidv4
    data: object
}

export interface wsErrorResponse {
    uuid: uuidv4
    code: number
    message: string
}

export type wsResponseWithoutUUID = Omit<wsResponse, "uuid">
export type wsErrorResponseWithoutUUID = Omit<wsErrorResponse, "uuid">

/**
 * Строка являющаяся валидным uuidv4 токеном
 */
type uuidv4 = string
