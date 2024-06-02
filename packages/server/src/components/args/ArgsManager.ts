import { ConfigManager } from "@root/components/config";
import { Args } from "@root/utils/interfaces";
import { program } from "commander";
import { Service } from "typedi";

@Service()
export class ArgsManager {
    #args: Args;

    constructor(configManager: ConfigManager) {
        program
            .option("--dev", null, false)
            .option("--host <host>", null, configManager.config.api.host)
            .option("--port <port>", null, configManager.config.api.port.toString())
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
