import { LogHelper } from "@root/helpers"

import { AbstractCommand, Category } from "../AbstractCommand"
// import { App } from "@root/LauncherServer"
// import prompts from "prompts"

export class BranchCommand extends AbstractCommand {
    constructor() {
        super("branch", "Branch selection", Category.BASIC)
    }

    async invoke(): Promise<void> {
        //TODO консолька немножко в ахуях

        // const response = await prompts([{
        //     type: 'select',
        //     name: 'result',
        //     message: 'Сhoose a branch',
        //     choices: [
        //         {
        //             title: "stable",
        //             value: '#0000ff'
        //         },
        //         {
        //             title: "latest",
        //             value: '#0000ff'
        //         },
        //         {
        //             title: "dev",
        //             value: '#0000ff'
        //         },
        //     ],
        //     initial: 0
        // }])

        // App.ConfigManager.setProp("branch", response.result)

        LogHelper.info("Method not implemented")
    }
}
