import { PrimaryProviderConfig } from "./auth/primaryProviders/AbstractProvider";
import { SecondProviderConfig } from "./auth/secondaryProviders/AbstractProvider";
import { AuthHandlerConfig } from "./auth/authHandlers/AbstractHandler";
import { TextureProviderConfig } from "./auth/textureProviders/AbstractTextureProvider";
import { HwidHandlerConfig } from "./hwid/AbstractHwidHandler";
import fs = require("fs");
import path = require("path");
import { StorageHelper } from "./helpers/StorageHelper";

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

  updatesUrl: Array<string>;

  auth: AuthConfig;
  hwid: HwidHandlerConfig;

  ws: WebSocketConfig;
}

export class ConfigManager {
  private config: LauncherServerConfig;

  constructor() {
    if (fs.existsSync(StorageHelper.configFile)) {
      this.load();
    } else {
      this.config = this.getDefaults();
      this.save();
    }
  }

  getProperty(property: string): any {
    const path = property.split('.');
    let prop: any = this.config;
    path.forEach((el) => {
      if (prop === undefined) throw new Error('getProperty error');
      prop = prop[el];
    })
    return prop;
  }

  getDefaults(): LauncherServerConfig {
    const config = new LauncherServerConfig();
    config.configVersion = "1";
    config.env = Envirovement.DEV;
    config.updatesUrl = ["https://mirror.aurora-launcher.ru/"];
    config.auth = new AuthConfig();
    config.auth.primaryProvider = new PrimaryProviderConfig();
    config.auth.primaryProvider.type = "none";
    config.auth.secondProvider = new SecondProviderConfig();
    config.auth.secondProvider.type = "none";
    config.auth.authHandler = new AuthHandlerConfig();
    config.auth.authHandler.type = "none";
    config.auth.textureProvider = new TextureProviderConfig();
    config.auth.textureProvider.type = "none";
    config.hwid = new HwidHandlerConfig();
    config.hwid.type = "none";
    config.ws = new WebSocketConfig();
    config.ws.address = "ws://localhost:1370/";
    config.ws.ip = "0.0.0.0";
    config.ws.port = 1370;
    return config;
  }

  load(): void {
    const config = fs.readFileSync(StorageHelper.configFile);
    try {
      this.config = JSON.parse(config.toString());
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error();
      }
      console.error(e);
    }
  }

  save(): void {
    fs.writeFileSync(StorageHelper.configFile, JSON.stringify(this.config, null, 4));
  }
}
