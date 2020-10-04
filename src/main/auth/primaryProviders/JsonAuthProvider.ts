import { AbstractProvider } from "./AbstractProvider"

export class JsonAuthProvider extends AbstractProvider {
    config: Config

    constructor(config: Config) {
        super("json")
        this.config = config
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    emit(login: string, password: string, ip: string): string | boolean {
        return false
    }
}

export interface Config {
    url?: string
    secret?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Response {
    login?: string
    error?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Request {
    login: string
    password: string
    ip: string
    secret: string
}
