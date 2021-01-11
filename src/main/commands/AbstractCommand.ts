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

export abstract class AbstractCommand {
    private readonly name: string
    private readonly description: string
    private readonly category: Category
    private readonly usage: string

    // <arg> - опциональный аргумент
    // [arg] - обязательный аргумент

    constructor(name: string, description: string, category: Category, usage?: string) {
        this.name = name.toLowerCase()
        this.description = description
        this.category = category
        this.usage = usage
    }

    abstract invoke(...args: Array<string>): void

    public getName(): string {
        return this.name
    }

    public getDescription(): string {
        return this.description
    }

    public getCategory(): Category {
        return this.category
    }

    public getUsage(): string {
        return this.usage
    }
}

export enum Category {
    AUTH = "auth",
    BASIC = "basic",
    UPDATES = "updates",
    COMMON = "common",
}
