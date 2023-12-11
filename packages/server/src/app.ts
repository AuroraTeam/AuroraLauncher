import "reflect-metadata";
import "source-map-support/register";

import { LauncherServer } from "./LauncherServer";
import Container from "typedi";

Container.get(LauncherServer);
