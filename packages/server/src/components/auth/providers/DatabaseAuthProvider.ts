import { AuthResponseData } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";
import { LogHelper } from "@root/utils";
import { DataSource, EntitySchema, In } from "typeorm";

import {
    AuthProvider,
    AuthProviderConfig,
    HasJoinedResponseData,
    ProfileResponseData,
    ProfilesResponseData,
} from "./AuthProvider";
import { randomUUID } from "crypto";
import { DatabasePasswordProvider } from "./DatabasePasswordProvider";

export class DatabaseAuthProvider implements AuthProvider {
    private userRepository;
    private passwordProvider;

    constructor({ auth }: LauncherServerConfig) {
        const authConfig = <DatabaseAuthProviderConfig>auth;
        this.passwordProvider = new DatabasePasswordProvider(authConfig);

        if (!authConfig.properties.tableName) {
            LogHelper.fatal("tableName not defined");
        }
        const UserEntity = getUserEntity(authConfig.properties);

        const connection = new DataSource({
            ...authConfig.connection,
            entities: [UserEntity],
        });

        connection.initialize().catch((error) => LogHelper.fatal(error));

        this.userRepository = connection.getRepository(UserEntity);
    }

    async auth(username: string, password: string): Promise<AuthResponseData> {
        const user = await this.userRepository.findOneBy({ username });
        if (!user) throw new Error("User not found");

        if (!(await this.passwordProvider.checkPassword(password, user.password)))
            throw new Error("Wrong password");

        const userData = {
            username,
            userUUID: user.userUUID,
            skinUrl: user.skinUrl,
            capeUrl: user.capeUrl,
            accessToken: randomUUID(),
        };

        await this.userRepository.update(
            { userUUID: user.userUUID },
            { accessToken: userData.accessToken },
        );

        return userData;
    }

    async join(accessToken: string, userUUID: string, serverID: string): Promise<boolean> {
        const user = await this.userRepository.findOneBy({
            accessToken,
            userUUID,
        });
        if (!user) return false;

        user.serverID = serverID;
        await this.userRepository.save(user);

        return true;
    }

    async hasJoined(username: string, serverID: string): Promise<HasJoinedResponseData> {
        const user = await this.userRepository.findOneBy({ username });
        if (!user) throw new Error("User not found");
        if (user.serverID !== serverID) {
            throw new Error("Invalid serverId");
        }

        return {
            userUUID: user.userUUID,
            skinUrl: user.skinUrl,
            capeUrl: user.capeUrl,
        };
    }

    async profile(userUUID: string): Promise<ProfileResponseData> {
        const user = await this.userRepository.findOneBy({ userUUID });
        if (!user) throw new Error("User not found");

        return {
            username: user.username,
            skinUrl: user.skinUrl,
            capeUrl: user.capeUrl,
        };
    }

    async profiles(usernames: string[]): Promise<ProfilesResponseData[]> {
        return [...(await this.userRepository.findBy({ username: In(usernames) }))].map((user) => ({
            id: user.userUUID,
            name: user.username,
        }));
    }
}

const getUserEntity = (properties: DatabaseAuthProviderConfig["properties"]) => {
    return new EntitySchema<UserEntity>({
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
        },
    });
};

export class DatabaseAuthProviderConfig extends AuthProviderConfig {
    passwordVerfier: string;
    passwordSalt?: string;
    connection: {
        type: AvaliableDataBaseType;
        host: string;
        port: number;
        username: string;
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
    };
}

type AvaliableDataBaseType = "mysql" | "mariadb" | "postgres" | "sqlite" | "oracle" | "mssql";

interface UserEntity {
    username: string;
    password: string;
    userUUID: string;
    accessToken: string;
    serverID: string;
    skinUrl: string;
    capeUrl: string;
}
