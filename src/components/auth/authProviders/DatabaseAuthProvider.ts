import { ConfigManager } from "@root/components/config"
import {
    AbstractAuthProvider,
    AbstractAuthProviderConfig,
    AuthResponseData,
    HasJoinedResponseData,
    LogHelper,
    PrivilegesResponseData,
    ProfileResponseData,
    ProfilesResponseData,
    UUIDHelper,
} from "@root/utils"
import { ResponseError } from "aurora-rpc-server"
import { DataSource, EntitySchema, In } from "typeorm"

export class DatabaseAuthProvider extends AbstractAuthProvider {
    protected static readonly type = "db"

    private readonly config = <DatabaseAuthProviderConfig>(
        this.configManager.config.auth
    )

    private userRepository

    constructor(configManager: ConfigManager) {
        super(configManager)

        if (!this.config.properties.tableName) {
            LogHelper.fatal("tableName not defined")
        }
        const UserEntity = getUserEntity(this.config.properties)

        const connection = new DataSource({
            ...this.config.connection,
            entities: [UserEntity],
        })

        connection.initialize().catch((error) => {
            LogHelper.fatal(error)
        })

        this.userRepository = connection.getRepository(UserEntity)
    }

    async auth(username: string): Promise<AuthResponseData> {
        const user = await this.userRepository.findOneBy({ username })
        if (!user) throw new ResponseError("User not found", 100)

        const userData = {
            username,
            userUUID: <string>user.userUUID,
            accessToken: <string>user.accessToken,
        }

        await this.userRepository.update(user, {
            accessToken: userData.accessToken,
        })

        return userData
    }

    async join(
        accessToken: string,
        userUUID: string,
        serverID: string
    ): Promise<boolean> {
        const user = await this.userRepository.findOneBy({
            accessToken: accessToken,
            userUUID: UUIDHelper.getWithDashes(userUUID),
        })
        if (!user) return false

        user.serverID = serverID
        await this.userRepository.save(user)

        return true
    }

    async hasJoined(
        username: string,
        serverID: string
    ): Promise<HasJoinedResponseData> {
        const user = await this.userRepository.findOneBy({ username })
        if (!user) throw Error("User not found")
        if (user.serverID !== serverID) throw Error("Invalid serverId")

        return {
            userUUID: <string>user.userUUID,
            skinUrl: <string>user.skinUrl,
            capeUrl: <string>user.capeUrl,
        }
    }

    async profile(userUUID: string): Promise<ProfileResponseData> {
        const user = await this.userRepository.findOneBy({ userUUID })
        if (!user) throw Error("User not found")

        return {
            username: <string>user.username,
            skinUrl: <string>user.skinUrl,
            capeUrl: <string>user.capeUrl,
        }
    }

    async privileges(accessToken: string): Promise<PrivilegesResponseData> {
        const user = await this.userRepository.findOneBy({ accessToken })

        return {
            onlineChat: <boolean>user.onlineChat,
            multiplayerServer: <boolean>user.multiplayerServer,
            multiplayerRealms: <boolean>user.multiplayerRealms,
            telemetry: <boolean>user.telemetry,
        }
    }

    async profiles(userUUIDs: string[]): Promise<ProfilesResponseData[]> {
        return [
            ...(await this.userRepository.findBy({ userUUID: In(userUUIDs) })),
        ].map((user) => ({
            id: <string>user.userUUID,
            name: <string>user.username,
        }))
    }
}

const getUserEntity = (
    properties: DatabaseAuthProviderConfig["properties"]
) => {
    return new EntitySchema({
        name: "user",
        tableName: properties.tableName,
        columns: {
            username: {
                type: String,
                unique: true,
                name: properties.usernameColumn,
            },
            password: {
                type: String,
                name: properties.passwordColumn,
            },
            userUUID: {
                type: String,
                unique: true,
                primary: true,
                generated: "uuid",
                name: properties.uuidColumn,
            },
            accessToken: {
                type: String,
                name: properties.accessTokenColumn,
            },
            serverID: {
                type: String,
                name: properties.serverIdColumn,
            },
            skinUrl: {
                type: String,
                name: properties.skinUrlColumn,
            },
            capeUrl: {
                type: String,
                name: properties.capeUrlColumn,
            },
            onlineChat: {
                type: Boolean,
                width: 1,
                default: true,
                name: properties.onlineChatColumn,
            },
            multiplayerServer: {
                type: Boolean,
                width: 1,
                default: true,
                name: properties.multiplayerServerColumn,
            },
            multiplayerRealms: {
                type: Boolean,
                width: 1,
                default: true,
                name: properties.multiplayerRealmsColumn,
            },
            telemetry: {
                type: Boolean,
                width: 1,
                default: false,
                name: properties.telemetryColumn,
            },
        },
    })
}

export class DatabaseAuthProviderConfig extends AbstractAuthProviderConfig {
    connection: {
        type: AvaliableDataBaseType
        host: string
        port: number
        user: string
        password: string
        database: string
    }
    properties: {
        tableName: string
        uuidColumn: string
        usernameColumn: string
        passwordColumn: string
        accessTokenColumn: string
        serverIdColumn: string
        skinUrlColumn: string
        capeUrlColumn: string
        onlineChatColumn: string
        multiplayerServerColumn: string
        multiplayerRealmsColumn: string
        telemetryColumn: string
    }
}

// type AvaliableDataBaseType = DatabaseType
type AvaliableDataBaseType =
    | "mysql"
    | "mariadb"
    | "postgres"
    | "sqlite"
    | "oracle"
    | "mssql"
    | "mongodb"
    | "better-sqlite3"
