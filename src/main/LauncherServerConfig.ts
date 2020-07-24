import { PrimaryProviderConfig } from "./auth/primaryProviders/AbstractProvider";
import { SecondProviderConfig } from "./auth/secondaryProviders/AbstractProvider";
import { AuthHandlerConfig } from "./auth/authHandlers/AbstractHandler";
import { TextureProviderConfig } from "./auth/textureProviders/AbstractTextureProvider";
import { HwidHandlerConfig } from "./hwid/AbstractHwidHandler";
import fs = require("fs");
import path = require("path");
import { StorageHelper } from "./helpers/StorageHelper";
import colors = require("colors/safe")



class WebSocketConfig {
  address: string;
  ip: string;
  port: number;
}

class AuthConfig {
  primaryProvider: PrimaryProviderConfig;
  secondProvider: SecondProviderConfig;
  authHandler: AuthHandlerConfig;
  textureProvider: TextureProviderConfig;
}

export enum Envirovement {
  PRODUCTION = "prod",
  DEV = "dev",
}

export class LauncherServerConfig {
  configVersion: string;

  env: Envirovement;

  auth: AuthConfig;
  hwid: HwidHandlerConfig;

  ws: WebSocketConfig;

  updatesUrl: string;
}

export class ConfigManager {
  private config: LauncherServerConfig;

  constructor() {
    if (fs.existsSync(path.resolve(StorageHelper.storageDir, "Server.json"))) {
      this.load();
    } else {
      this.config = this.getDefaults();
      this.save();
    }
  }

  getProperty(property: string): any {}

  getDefaults(): LauncherServerConfig {
    return this.config;
  }

  load(): void {
    const config = fs.readFileSync(
      path.resolve(StorageHelper.storageDir, "Server.json")
    );
    try {
      this.config = JSON.parse(config.toString());
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error()
      }
      console.error(e)
    }
  }

  save(): void {
    fs.writeFileSync(
      path.resolve(StorageHelper.storageDir, "Server.json"),
      JSON.stringify(this.config, null, 4)
    );
  }
}
