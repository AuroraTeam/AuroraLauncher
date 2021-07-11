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

    static getDefaults(): WebSocketConfig {
        const defaults = new WebSocketConfig()
        defaults.address = "ws://localhost:1370/"
        defaults.ip = "0.0.0.0"
        defaults.port = 1370
        defaults.enableListing = true
        defaults.hideListing = false
        defaults.useSSL = false
        defaults.ssl = {
            cert: "/path/to/cert.pem",
            key: "/path/to/key.pem",
        }
        return defaults
    }
}
