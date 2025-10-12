import ReadLine from "readline";

import { Service } from "@freshgum/typedi";
import { LogHelper } from "@root/helpers";

import { LangManager } from "../langs/LangManager";
import { AbstractCommand } from "./AbstractCommand";

@Service([LangManager])
export class CommandsManager {
    public commands: Map<string, AbstractCommand> = new Map();
    console: ReadLine.Interface;

    constructor(private readonly langManager: LangManager) {
        this.console = ReadLine.createInterface({
            input: process.stdin,
            output: process.stdout,
            completer: this.completer,
            prompt: "",
        });

        this.console.on("line", this.handleLine);
    }

    registerCommands(commands: AbstractCommand[]): void {
        commands.forEach((command: AbstractCommand) => {
            this.commands.set(command.info.name, command);
        });
    }

    /**
     * Функция, определяющая возможные варианты автодополнения для введенной строки.
     *
     * @param line Введенная строка.
     * @returns Массив возможных вариантов автодополнения и исходную строку.
     */
    private completer = (line: string): [string[], string] => {
        const completions = Array.from(this.commands.keys());
        const hits = completions.filter((c) => c.startsWith(line.toLowerCase()));

        return [hits.length ? hits : completions, line];
    };

    /**
     * Функция-обработчик события "line", вызывается при вводе новой строки в консоли.
     *
     * @param line Введенная строка.
     */
    private handleLine = (line: string): void => {
        LogHelper.handleUserPrompt(line);

        const args = line.match(/"[^"]*"|[^\s"]+/g)?.map((s) => s.trim().replace(/"/g, ""));
        if (!args?.length) return;

        const cmd = args.shift()!.toLowerCase();
        if (!cmd || !this.commands.has(cmd)) {
            return LogHelper.error(this.langManager.getTranslate.CommandsManager.cmdNotFound, cmd);
        }

        LogHelper.dev(this.langManager.getTranslate.CommandsManager.invokeCmd, cmd);

        this.commands.get(cmd)?.invoke(...args);
    };
}
