export class ApiConfig {
    host: string;
    port: number;
    useSSL: boolean;
    useHTTP2: boolean;
    ssl: {
        cert: string;
        key: string;
    };
    disableListing: boolean;
    hideListing: boolean;

    constructor() {
        this.host = "0.0.0.0";
        this.port = 1370;
        this.useSSL = false;
        this.useHTTP2 = false;
        this.ssl = {
            cert: "/path/to/cert.pem",
            key: "/path/to/key.pem",
        };
        this.disableListing = false;
        this.hideListing = false;
    }
}
