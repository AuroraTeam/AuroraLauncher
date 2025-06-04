import "source-map-support/register";

import { Container } from "@freshgum/typedi";

import { LauncherServer } from "./LauncherServer";

Container.get(LauncherServer);
