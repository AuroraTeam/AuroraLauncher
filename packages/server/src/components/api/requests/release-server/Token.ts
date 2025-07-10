import { Service } from "@freshgum/typedi";
import { VerifyManager } from "@root/components/secure/VerifyManager";
import { SecureHelper } from "@root/utils";

@Service()
export class TokenManager {
    constructor(private verifyManager: VerifyManager) {}
    private token = SecureHelper.generateRandomToken(32);
    private encryptedToken = this.verifyManager.encryptToken(this.token);

    public getToken() {
        return this.token;
    }
    public getEncryptedToken() {
        return this.encryptedToken;
    }
}
