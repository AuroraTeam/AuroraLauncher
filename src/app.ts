import "source-map-support/register"
import "reflect-metadata"

import { Container } from "typedi"

import { LauncherServer } from "./LauncherServer"

Container.get(LauncherServer)
