export class WebSocketConfig {
    address: string
    ip: string
    port: number
    enableListing: boolean
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
            enableListing: true,
            hideListing: false,
            useSSL: false,
            ssl: {
                cert: "/path/to/cert.pem",
                key: "/path/to/key.pem",
            },
        }
    }
}
