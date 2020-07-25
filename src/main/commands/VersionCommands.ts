import { AbstractCommand, Category } from "./AbstractCommand"
import * as colors from "colors/safe"

export class VersionCommand extends AbstractCommand {
    name: string = "version"
    description: string = "Узнать версию"
    category: Category = Category.BASIC
    usage: string

    execute(): void {
        console.log(
            colors.bold(
                colors.cyan("AuroraLauncher ") +
                colors.green("LauncherServer ") +
                "v" +
                colors.yellow(process.env.npm_package_version)
            )
        )
    }
}