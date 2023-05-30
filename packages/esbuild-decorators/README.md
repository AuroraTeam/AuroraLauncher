# esbuild-decorators (@aurora-launcher/esbuild-decorators)

Use SWC to emit decorator metadata

## Install

With npm:

```bash
npm i -D @aurora-launcher/esbuild-decorators
```

## Usage

```js
import { esbuildDecorators } from "@aurora-launcher/esbuild-decorators";
import { context } from "esbuild";

// ...
const ctx = await context({
    // ...
    plugins: [esbuildDecorators()],
    // ...
});
// ...
```

## Thanks

[@egoist](https://github.com/egoist) for the [tsup](https://github.com/egoist/tsup) library
