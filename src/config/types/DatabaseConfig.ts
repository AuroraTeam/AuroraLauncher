export class DatabaseConfig {
    host: string
    port: number
    user: string
    password: string
    database: string
    synchronize: boolean
    logging: boolean

    static getDefaultConfig(): DatabaseConfig {
        return {
            host: "localhost",
            port: 3306,
            user: "admin",
            password: "password",
            database: "test",
            synchronize: true,
            logging: false,
        }
    }
}
