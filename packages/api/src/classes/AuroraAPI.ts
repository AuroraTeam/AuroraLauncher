import { APIError, Client, Response, ResponseError } from "aurora-rpc-client"

import { AuthResponseData } from "../types/AuthResponse"
import { ProfileResponseData } from "../types/ProfileResponse"
import { ServersResponseData } from "../types/ServersResponse"
import { UpdatesResponseData } from "../types/UpdatesResponse"

export class AuroraAPI {
    #clientInstance = new Client()
    #url?: string

    constructor(url?: string) {
        this.#url = url
    }

    public async connect(url?: string) {
        const _url = url || this.#url
        // TODO move to aurora-rpc-client
        if (!_url) throw new Error("Url not defined")

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
