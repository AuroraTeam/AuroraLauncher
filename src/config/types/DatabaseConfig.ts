export class DatabaseConfig {
    host: string
    port: number
    user: string
    password: string
    database: string
    synchronize: boolean
    logging: boolean
    properties: {
        tableName: string
    }

    static getDefaultConfig(): DatabaseConfig {
        return {
            host: "localhost",
            port: 3306,
            user: "admin",
            password: "password",
            database: "test",
            synchronize: true,
            logging: false,
            properties: {
                tableName: "users",
            },
        }
    }
}
