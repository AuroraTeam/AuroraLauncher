import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";
import { LogHelper, UUIDHelper } from "@root/utils";
import { ResponseError } from "aurora-rpc-server";
import { DataSource, EntitySchema, In } from "typeorm";

import {
    AuthProvider,
    AuthProviderConfig,
    AuthResponseData,
    HasJoinedResponseData,
    PrivilegesResponseData,
    ProfileResponseData,
    ProfilesResponseData,
} from "./AuthProvider";

export class DatabaseAuthProvider implements AuthProvider {
    private userRepository;

    constructor({ auth }: LauncherServerConfig) {
        const config = <DatabaseAuthProviderConfig>auth;

        if (!config.properties.tableName) {
            LogHelper.fatal("tableName not defined");
        }
        const UserEntity = getUserEntity(config.properties);

        const connection = new DataSource({
            ...config.connection,
            entities: [UserEntity],
        });

        connection.initialize().catch((error) => LogHelper.fatal(error));

        this.userRepository = connection.getRepository(UserEntity);
    }

    async auth(username: string): Promise<AuthResponseData> {
        const user = await this.userRepository.findOneBy({ username });
        if (!user) throw new ResponseError("User not found", 100);

        const userData = {
            username,
            userUUID: user.userUUID as string,
            accessToken: user.accessToken as string,
        };

        await this.userRepository.update(user, {
            accessToken: userData.accessToken,
        });

        return userData;
    }

    async join(
        accessToken: string,
        userUUID: string,
        serverID: string
    ): Promise<boolean> {
        const user = await this.userRepository.findOneBy({
            accessToken: accessToken,
            userUUID: UUIDHelper.getWithDashes(userUUID),
        });
        if (!user) return false;

        user.serverID = serverID;
        await this.userRepository.save(user);

        return true;
    }

    async hasJoined(
        username: string,
        serverID: string
    ): Promise<HasJoinedResponseData> {
        const user = await this.userRepository.findOneBy({ username });
        if (!user) throw new ResponseError("User not found", 100);
        if (user.serverID !== serverID) {
            throw new ResponseError("Invalid serverId", 101);
        }

        return {
            userUUID: user.userUUID as string,
            skinUrl: user.skinUrl as string,
            capeUrl: user.capeUrl as string,
        };
    }

    async profile(userUUID: string): Promise<ProfileResponseData> {
        const user = await this.userRepository.findOneBy({ userUUID });
        if (!user) throw new ResponseError("User not found", 100);

        return {
            username: user.username as string,
            skinUrl: user.skinUrl as string,
            capeUrl: user.capeUrl as string,
        };
    }

    async privileges(accessToken: string): Promise<PrivilegesResponseData> {
        const user = await this.userRepository.findOneBy({ accessToken });

        return {
            onlineChat: user.onlineChat as boolean,
            multiplayerServer: user.multiplayerServer as boolean,
            multiplayerRealms: user.multiplayerRealms as boolean,
            telemetry: user.telemetry as boolean,
        };
    }

    async profiles(userUUIDs: string[]): Promise<ProfilesResponseData[]> {
        return [
            ...(await this.userRepository.findBy({ userUUID: In(userUUIDs) })),
        ].map((user) => ({
            id: user.userUUID as string,
            name: user.username as string,
        }));
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
    });
};

export class DatabaseAuthProviderConfig extends AuthProviderConfig {
    connection: {
        type: AvaliableDataBaseType;
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    };
    properties: {
        tableName: string;
        uuidColumn: string;
        usernameColumn: string;
        passwordColumn: string;
        accessTokenColumn: string;
        serverIdColumn: string;
        skinUrlColumn: string;
        capeUrlColumn: string;
        onlineChatColumn: string;
        multiplayerServerColumn: string;
        multiplayerRealmsColumn: string;
        telemetryColumn: string;
    };
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
    | "better-sqlite3";
