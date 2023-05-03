import { Client, Response, ResponseError } from "aurora-rpc-client"

import { AuthResponseData } from "../types/AuthResponse"
import { ProfileResponseData } from "../types/ProfileResponse"
import { ServersResponseData } from "../types/ServersResponse"
import { UpdatesResponseData } from "../types/UpdatesResponse"
import { APIError } from "./APIError"

export class AuroraAPI {
    #clientInstance: Client
    #url?: string

    constructor(url?: string) {
        this.#url = url
        this.#clientInstance = new Client()
    }

    public async connect(url?: string) {
        const _url = url || this.#url
        if (!_url) return

        return await this.#clientInstance.connect(_url)
    }

    public close(code?: number, data?: string) {
        this.#clientInstance.close(code, data)
    }

    public async auth(login: string, password: string) {
        return <AuthResponseData>await this.#getRequest("auth", { login, password })
    }

    public async getServers() {
        return <ServersResponseData>await this.#getRequest("servers")
    }

    public async getProfile(uuid: string) {
        return <ProfileResponseData>await this.#getRequest("profile", { uuid })
    }

    public async getUpdates(dir: string) {
        return <UpdatesResponseData>await this.#getRequest("updates", { dir })
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
