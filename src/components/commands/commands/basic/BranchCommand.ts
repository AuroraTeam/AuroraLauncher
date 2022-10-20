import { LangManager } from "@root/components"
import { AbstractCommand, Category, LogHelper } from "@root/utils"

// import { App } from "@root/app"
// import prompts from "prompts"

export class BranchCommand extends AbstractCommand {
    constructor(langManager: LangManager) {
        super({
            name: "branch",
            description: "Branch selection",
            category: Category.BASIC,
        })
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
