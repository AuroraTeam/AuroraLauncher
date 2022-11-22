import "reflect-metadata"

import { container } from "tsyringe"

import { LauncherServer } from "./LauncherServer"

container.resolve(LauncherServer)
