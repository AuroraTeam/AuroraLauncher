import { Service } from "@freshgum/typedi";
import { VerifyManager } from "@root/components/secure/VerifyManager";
import { SecureHelper } from "@root/helpers";

// TODO И вот хуй знает что оно здесь делает
@Service([VerifyManager])
export class TokenManager {
    private token = SecureHelper.generateRandomToken(32);
    private encryptedToken: string;

    constructor(verifyManager: VerifyManager) {
        this.encryptedToken = verifyManager.encryptToken(this.token);
    }

    public getToken() {
        return this.token;
    }
    public getEncryptedToken() {
        return this.encryptedToken;
    }
}
