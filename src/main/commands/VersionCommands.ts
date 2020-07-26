import { AbstractCommand, Category } from "./AbstractCommand"
import { LogHelper } from "../helpers/LogHelper"
import * as colors from "colors/safe"

export class VersionCommand extends AbstractCommand {
    name: string = "version"
    description: string = "Узнать версию"
    category: Category = Category.BASIC
    usage: string

    invoke(): void {
        LogHelper.raw(
            colors.bold(
                colors.cyan("AuroraLauncher ") +
                colors.green("LauncherServer ") +
                "v" +
                colors.yellow(process.env.npm_package_version)
            )
        )
    }
}
