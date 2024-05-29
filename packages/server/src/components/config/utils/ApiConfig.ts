export class ApiConfig {
    host: string;
    port: number;
    useSSL: boolean;
    ssl: {
        cert: string;
        key: string;
    };
    disableListing: boolean;
    hideListing: boolean;
    injector: {
        skinDomains: string[];
    };

    static getDefaultConfig(): ApiConfig {
        return {
            host: "0.0.0.0",
            port: process.env.SERVER_PORT || 1370,
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
        };
    }
}
