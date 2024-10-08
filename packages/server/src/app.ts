import "reflect-metadata";
import "source-map-support/register";

import Container from "typedi";

import { LauncherServer } from "./LauncherServer";

Container.get(LauncherServer);
