// Used https://github.com/egoist/tsup/blob/dev/src/esbuild/swc.ts

import path from "path";

import swc from "@swc/core";

/**
 * Use SWC to emit decorator metadata
 */
export const esbuildDecorators = () => ({
    name: "swc",
    setup(build) {
        // Force esbuild to keep class names as well
        build.initialOptions.keepNames = true;

        build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
            const isTs = /\.tsx?$/.test(args.path);

            const jsc = {
                parser: {
                    syntax: isTs ? "typescript" : "ecmascript",
                    decorators: true,
                },
                transform: {
                    legacyDecorator: true,
                    decoratorMetadata: true,
                },
                keepClassNames: true,
                target: "es2022",
            };

            const result = await swc.transformFile(args.path, {
                jsc,
                sourceMaps: false,
                configFile: false,
                swcrc: false,
            });

            let code = result.code;
            if (result.map) {
                const map = JSON.parse(result.map);
                // Make sure sources are relative path
                map.sources = map.sources.map((source) => {
                    return path.isAbsolute(source)
                        ? path.relative(path.dirname(args.path), source)
                        : source;
                });
                code += `//# sourceMappingURL=data:application/json;base64,${Buffer.from(
                    JSON.stringify(map),
                ).toString("base64")}`;
            }
            return {
                contents: code,
            };
        });
    },
});
