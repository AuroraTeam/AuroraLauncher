export class ApiConfig {
    host: string;
    port: number;
    useSSL: boolean;
    ssl: {
        root_cert: string;
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
            port: 1370,
            useSSL: false,
            ssl: {
                root_cert: "/path/to/root_cert.pem",
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
