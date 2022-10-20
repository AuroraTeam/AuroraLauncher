import { App } from "@root/LauncherServer"
import {
    AbstractAuthProvider,
    AuthResponseData,
    HasJoinedResponseData,
    PrivilegesResponseData,
    ProfileResponseData,
    ProfilesResponseData,
    UUIDHelper,
} from "@root/utils"
import {
    Column,
    DataSource,
    Entity,
    Generated,
    In,
    PrimaryGeneratedColumn,
} from "typeorm"
import { v4 } from "uuid"

// typeorm похоже придётся выпиливать
export class MySQLAuthProvider extends AbstractAuthProvider {
    static type = "mysql"

    private readonly db = App.ConfigManager.config.db

    private readonly connection = new DataSource({
        type: this.db.type,
        host: this.db.host,
        port: this.db.port,
        username: this.db.user,
        password: this.db.password,
        database: this.db.database,
        entities: [User],
        synchronize: this.db.synchronize,
        logging: this.db.logging,
    })

    private userRepository

    constructor() {
        super()

        this.connection
            .initialize()
            .then(() => {
                /* мб лог надо */
            })
            .catch(() => {
                /* мб лог надо */
            })

        this.userRepository = this.connection.getRepository(User)
    }

    async auth(username: string): Promise<AuthResponseData> {
        const user = await this.userRepository.findOne({
            where: {
                username: username,
            },
        })

        if (!user) throw Error("User not found")

        const userData = {
            username,
            userUUID: user.userUUID,
            accessToken: UUIDHelper.getWithoutDashes(v4()),
        }

        const accessToken = userData.accessToken //костыль.

        await this.userRepository.update(user, {
            accessToken,
        })

        return userData
    }

    async join(
        accessToken: string,
        userUUID: string,
        serverID: string
    ): Promise<boolean> {
        const user = await this.userRepository.findOne({
            where: {
                accessToken: accessToken,
                userUUID: userUUID,
            },
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
        const user = await this.userRepository.findOne({
            where: {
                username: username,
            },
        })

        if (!user) throw Error("User not found")
        if (user.serverID !== serverID) throw Error("Invalid serverId")

        return user
    }

    async profile(userUUID: string): Promise<ProfileResponseData> {
        const user: User = await this.userRepository.findOne({
            where: {
                userUUID: userUUID,
            },
        })

        if (!user) throw Error("User not found")

        return user
    }

    privileges(): PromiseOr<PrivilegesResponseData> {
        return {
            onlineChat: true,
            multiplayerServer: true,
            multiplayerRealms: true,
            telemetry: false,
        }
    }

    async profiles(userUUIDs: string[]): Promise<ProfilesResponseData[]> {
        return Array.from(
            await this.userRepository.findBy({
                userUUID: In(userUUIDs),
            })
        ).map((usr) => ({
            id: usr.userUUID,
            name: usr.username,
        }))
    }
}

@Entity()
class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column("text", { unique: true })
    username: string

    @Column("text")
    password: string

    @Column("text", { unique: true })
    @Generated("uuid")
    userUUID: string

    @Column("text")
    clientToken: string

    @Column("text")
    accessToken: string

    @Column("text")
    serverID: string

    @Column("text")
    skinUrl: string

    @Column("text")
    capeUrl: string

    // Privileges
    // MySQL fix https://github.com/typeorm/typeorm/issues/3622 | Пофиксили уже вроде // Не похоже
    @Column({ width: 1, type: "boolean", default: true })
    onlineChat: boolean

    @Column({ width: 1, type: "boolean", default: true })
    multiplayerServer: boolean

    @Column({ width: 1, type: "boolean", default: true })
    multiplayerRealms: boolean

    @Column({ width: 1, type: "boolean", default: false })
    telemetry: boolean
}
