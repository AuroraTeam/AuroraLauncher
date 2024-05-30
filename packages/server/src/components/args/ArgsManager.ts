import { Service } from "typedi";
import { Args } from "@root/utils/interfaces";
import { ConfigManager } from "@root/components/config";
import { program } from "commander";

@Service()
export class ArgsManager {
  #args: Args;

  constructor(configManager: ConfigManager) {
    program
      .option('--host', null, configManager.config.api.host)
      .option('--port', null, configManager.config.api.port.toString())
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
