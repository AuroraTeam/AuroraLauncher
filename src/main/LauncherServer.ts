require("source-map-support").install();
// import { LauncherSocket } from './requests/websocket';
import { LauncherServerConfig, ConfigManager } from "./LauncherServerConfig";
import { StorageHelper } from "./helpers/StorageHelper";
import { AuthManager } from "./auth/AuthManager";
import { CommandsManager } from "./commands/CommandsManager";
import { createWebSocketStream } from "ws";

export class LauncherServer {
  config: ConfigManager;
  // websocket: LauncherSocket
  AuthManager: AuthManager;
  CommandsManager: CommandsManager;

  constructor() {
    StorageHelper.createMissing();
    this.config = new ConfigManager();
    this.AuthManager = new AuthManager(this);
    this.CommandsManager = new CommandsManager(this);
  }

  main(): void {}
}

const ls = new LauncherServer();
ls.main();
