// TODO А нужно ли нам это?
export class ValidationHelper {
    static username(username: string): boolean {
        return this.raw(username, "^[A-Za-z0-9_]{4,16}$")
    }

    static email(email: string): boolean {
        return this.raw(
            email,
            "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$"
        )
    }

    static uuidV4(uuid: string): boolean {
        return this.raw(uuid, "^[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}$")
    }

    static raw(str: string, pattern: string): boolean {
        return new RegExp(pattern).test(str)
    }
}
