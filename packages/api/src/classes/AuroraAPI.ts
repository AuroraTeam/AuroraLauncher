import { Client, Events, Response, ResponseError } from "aurora-rpc-client"

import { AuthResponseData } from "../types/AuthResponse"
import { ProfileResponseData } from "../types/ProfileResponse"
import { ServersResponseData } from "../types/ServersResponse"
import { UpdatesResponseData } from "../types/UpdatesResponse"
import { APIError } from "./APIError"

export class AuroraAPI {
    #clientInstance

    constructor(url?: string, events?: Events) {
        this.#clientInstance = new Client(url, events)
    }

    public connect(url?: string, events?: Events) {
        return this.#clientInstance.connect(url, events)
    }

    public close(code?: number, data?: string) {
        this.#clientInstance.close(code, data)
    }

    public async auth(login: string, password: string) {
        return await this.#getRequest<AuthResponseData>("auth", { login, password })
    }

    public async getServers() {
        return await this.#getRequest<ServersResponseData>("servers")
    }

    public async getProfile(uuid: string) {
        return await this.#getRequest<ProfileResponseData>("profile", { uuid })
    }

    public async getUpdates(dir: string) {
        return await this.#getRequest<UpdatesResponseData>("updates", { dir })
    }

    async #getRequest<T extends Response["result"]>(method: string, payload?: any): Promise<T> {
        try {
            const { result } = await this.#clientInstance.send(method, payload)
            return <T>result
        } catch (err) {
            const {
                error: { code, message },
            } = <ResponseError>err
            throw new APIError(code, message)
        }
    }
}
