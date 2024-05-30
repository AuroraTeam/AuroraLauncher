import { Service } from "typedi";
import { Args } from "@root/utils/interfaces";
import { ConfigManager } from "@root/components/config";
import yargs from "yargs";

@Service()
export class ArgsManager {
  #args: Args;

  constructor() {
      this.#args = yargs
        .option('port', {
            type: 'number',
            default: ConfigManager.config.api.port
        })
        .option('host', {
            type: 'string',
            default: ConfigManager.config.api.host
        })
      .argv as Args;
  }

    /**
     * It returns the args object.
     * @returns The args object
     */
    get args(): Args {
        return this.#args;
    }
}
