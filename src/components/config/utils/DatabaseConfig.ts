export class DatabaseConfig {
    type: AvaliableDataBaseType
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
            type: "mysql",
            host: "localhost",
            port: 3306,
            user: "admin",
            password: "password",
            database: "test",
            synchronize: true,
            logging: false,
            properties: {
                tableName: "User",
            },
        }
    }
}

type AvaliableDataBaseType = "mysql" | "mariadb"
// | "postgres"
// | "sqlite"
// | "oracle"
// | "mssql"
// | "mongodb"
// | "better-sqlite3"
