export class WebSocketConfig {
    address: string
    ip: string
    port: number
    disableListing: boolean
    hideListing: boolean
    useSSL: boolean
    ssl: {
        cert: string
        key: string
    }

    static getDefaultConfig(): WebSocketConfig {
        return {
            address: "ws://localhost:1370/ws",
            ip: "0.0.0.0",
            port: 1370,
            disableListing: true,
            hideListing: false,
            useSSL: false,
            ssl: {
                cert: "/path/to/cert.pem",
                key: "/path/to/key.pem",
            },
        }
    }
}
