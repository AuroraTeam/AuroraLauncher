export class ApiConfig {
    addresses: {
        web: string
        websocket: string
    }
    host: string
    port: number
    useSSL: boolean
    ssl: {
        cert: string
        key: string
    }
    disableListing: boolean
    hideListing: boolean
    injector: {
        skinDomains: string[]
    }

    static getDefaultConfig(): ApiConfig {
        return {
            addresses: {
                web: "http://localhost:1370/",
                websocket: "ws://localhost:1370/ws",
            },
            host: "0.0.0.0",
            port: 1370,
            useSSL: false,
            ssl: {
                cert: "/path/to/cert.pem",
                key: "/path/to/key.pem",
            },
            disableListing: false,
            hideListing: false,
            injector: {
                skinDomains: [],
            },
        }
    }
}
