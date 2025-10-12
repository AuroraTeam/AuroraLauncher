import { Service } from "@freshgum/typedi";
import { ConfigManager } from "@root/components/config/ConfigManager";
import { program } from "commander";

export interface Args {
    port: number;
    host: string;
}

@Service([ConfigManager])
export class ArgsManager {
    #args: Args;

    constructor(configManager: ConfigManager) {
        program
            .option("--dev", undefined, false)
            .option("--host <host>", undefined, configManager.config.api.host)
            .option("--port <port>", undefined, configManager.config.api.port.toString())
            .parse();

        this.#args = program.opts();
    }

    /**
     * It returns the args object.
     * @returns The args object
     */
    get args(): Args {
        return this.#args;
    }
}
