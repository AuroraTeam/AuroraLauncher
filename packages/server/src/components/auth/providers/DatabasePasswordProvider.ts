import { HashHelper } from "@aurora-launcher/core";
import { argon2Verify, bcryptVerify } from "hash-wasm";

import { DatabaseAuthProviderConfig } from "./DatabaseAuthProvider";

export class DatabasePasswordProvider {
    private pattern = /(\w+)\s*(\((.*)\))?(\s*\+\s*(.*))?/;
    private verifierFunction: (password: string, passwordHash: string) => PromiseOr<boolean>;
    private passwordSalt: string;

    constructor(authConfig: DatabaseAuthProviderConfig) {
        const { passwordVerfier, passwordSalt } = authConfig;
        this.buildVerifierFunction(passwordVerfier);
        this.passwordSalt = passwordSalt;
    }

    checkPassword(password: string, passwordHash: string) {
        return this.verifierFunction(password, passwordHash);
    }

    private buildVerifierFunction(passwordVerfier: string) {
        const matches = this.parseFormat(passwordVerfier);
        const algo = matches[1];

        switch (algo) {
            case "hash": {
                const validatePasswordFormat = this.validatePasswordFormat(matches[3] || "pass");
                this.verifierFunction = (password: string, passwordHash: string) =>
                    passwordHash === validatePasswordFormat(password, this.passwordSalt);
                break;
            }
            case "bcrypt":
                this.verifierFunction = (password: string, passwordHash: string) =>
                    bcryptVerify({ password, hash: passwordHash });
                break;
            case "argon2":
                this.verifierFunction = (password: string, passwordHash: string) =>
                    argon2Verify({ password, hash: passwordHash });
                break;
            // case "scrypt":
            // case "pbkdf2":
            // TODO Реализовать по необходимости
            default:
                throw new Error(`Unsupported algorithm: ${algo}`);
        }
    }

    private parseFormat(format: string) {
        const matches = format.match(this.pattern);
        if (!matches) throw new Error(`Invalid password format: ${format}`);
        return matches;
    }

    private validatePasswordFormat(format: string) {
        if (!format) return;

        if (format === "pass") return (pass: string) => pass;
        if (format === "salt") return (pass: string, salt: string) => salt;

        const matches = this.parseFormat(format);

        const algo = matches[1];
        const inner = this.validatePasswordFormat(matches[3]);
        const additional = this.validatePasswordFormat(matches[5]);

        const result: any[] = [];

        if (["pass", "hash"].includes(algo)) {
            result.push(this.validatePasswordFormat(algo));
        } else if (inner) {
            try {
                result.push((pass: string, salt: string) =>
                    HashHelper.getHash(inner(pass, salt), algo),
                );
            } catch {
                throw new Error(`Unsupported algorithm: ${algo}`);
            }
        }

        if (additional) {
            result.push(additional);
        }

        return (pass: string, salt: string) => result.map((fn) => fn(pass, salt)).join("");
    }
}
