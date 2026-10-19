/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { test } = require("node:test");
const { loadSource } = require("./helpers/load-source.cjs");

const nextTurn = () => new Promise(setImmediate);

for (const signal of ["SIGINT", "SIGTERM"]) {
  test(`entrypoint sends ${signal} to the asynchronous server shutdown`, async () => {
    const processState = new EventEmitter();
    let calls = 0;
    let complete;
    const pending = new Promise((resolve) => {
      complete = resolve;
    });
    const errors = [];
    loadSource(
      "app.ts",
      (id) => {
        if (id === "source-map-support/register") return {};
        if (id === "./LauncherServer")
          return {
            LauncherServer: class {
              async start() {}
              async stop() {
                calls++;
                await pending;
              }
            },
          };
        throw new Error(`Unexpected import: ${id}`);
      },
      { process: processState, console: { error: (...args) => errors.push(args) } },
    );
    processState.emit(signal);
    await nextTurn();
    assert.equal(calls, 1);
    assert.deepEqual(errors, []);
    complete();
    await nextTurn();
    assert.equal(processState.exitCode, undefined);
  });
}

test("entrypoint reports a failed shutdown and sets exit code 1", async () => {
  const processState = new EventEmitter();
  const failure = new Error("cleanup failed");
  const errors = [];
  loadSource(
    "app.ts",
    (id) => {
      if (id === "source-map-support/register") return {};
      return {
        LauncherServer: class {
          async start() {}
          async stop() {
            throw failure;
          }
        },
      };
    },
    { process: processState, console: { error: (...args) => errors.push(args) } },
  );
  processState.emit("SIGTERM");
  await nextTurn();
  assert.equal(processState.exitCode, 1);
  assert.equal(errors[0][1], failure);
});

test("stop command waits for the shared shutdown callback", async () => {
  let complete;
  let finished = false;
  const pending = new Promise((resolve) => {
    complete = resolve;
  });
  const { StopCommand } = loadSource("components/commands/commands/basic/StopCommand.ts", (id) => {
    if (id === "@freshgum/typedi") return { Service: () => (type) => type };
    if (id.endsWith("/AbstractCommand"))
      return { AbstractCommand: class {}, CommandCategory: { BASIC: "basic" } };
    return new Proxy({}, { get: (_, name) => ({ name }) });
  });
  const command = new StopCommand(
    { getTranslate: { CommandsManager: { commands: { basic: { StopCommand: "Stop" } } } } },
    () => pending,
  );
  const result = command.invoke().then(() => {
    finished = true;
  });
  await nextTurn();
  assert.equal(finished, false);
  complete();
  await result;
  assert.equal(finished, true);
});

test("readline Ctrl+C uses shutdown instead of closing only the console", async () => {
  const readline = new EventEmitter();
  let calls = 0;
  const { CommandsManager } = loadSource(
    "components/commands/CommandsManager.ts",
    (id) => {
      if (id === "readline") return { createInterface: () => readline };
      if (id === "@freshgum/typedi") return { Service: () => (type) => type };
      if (id === "@root/helpers") return { LogHelper: { error() {} } };
      return new Proxy({}, { get: (_, name) => ({ name }) });
    },
    { process: { stdin: {}, stdout: {} } },
  );
  const manager = new CommandsManager({}, async () => {
    calls++;
  });
  manager.start();
  readline.emit("SIGINT");
  await nextTurn();
  assert.equal(calls, 1);
});

test("shutdown aborts a pending update check without logging it as a failure", async () => {
  let signal;
  const errors = [];
  const { UpdateManager } = loadSource("components/update/UpdateManager.ts", (id) => {
    if (id === "path") return require("node:path");
    if (id === "@freshgum/typedi") return { Service: () => (type) => type };
    if (id === "@aurora-launcher/core")
      return {
        HttpHelper: {
          getResourceFromJson: (_url, _headers, abortSignal) =>
            new Promise((_, reject) => {
              signal = abortSignal;
              signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
            }),
        },
      };
    if (id === "@root/helpers")
      return {
        SystemHelper: { isStandalone: () => false, getPlatform: () => "win32" },
        LogHelper: { info() {}, error: (error) => errors.push(error) },
      };
    if (id.endsWith("package.json")) return { version: "0.0.5-dev.99" };
    if (id === "semver") return {};
    return new Proxy({}, { get: (_, name) => ({ name }) });
  });
  const manager = new UpdateManager({}, { getTranslate: { UpdateManager: { check: "checking" } } });
  const check = manager.checkUpdate();
  manager.stop();
  assert.equal(signal.aborted, true);
  await check;
  await manager.checkUpdate();
  assert.deepEqual(errors, []);
});

test("HTTP JSON helper forwards cancellation to the pending request", async () => {
  const controller = new AbortController();
  const aborted = new Error("request aborted");
  let receivedSignal;
  const { HttpHelper } = loadSource("../../core/src/helpers/HttpHelper.ts", (id) => {
    if (id === ".") return { JsonHelper: { parse: JSON.parse } };
    if (id === "undici")
      return {
        request: (_url, { signal }) =>
          new Promise((_, reject) => {
            receivedSignal = signal;
            signal.addEventListener("abort", () => reject(aborted), { once: true });
          }),
      };
    if (id === "p-map") return () => {};
    return require(id);
  });
  const pending = HttpHelper.getResourceFromJson(
    "https://example.test/versions",
    undefined,
    controller.signal,
  );
  controller.abort();
  await assert.rejects(pending, (error) => error === aborted);
  assert.equal(receivedSignal, controller.signal);
});

test("Watcher cannot be restarted by a finishing download after permanent shutdown", async () => {
  const events = [];
  let ready;
  const pending = new Promise((resolve) => {
    ready = resolve;
  });
  const { Watcher } = loadSource("components/watcher/Watcher.ts", (id) => {
    if (id === "path") return require("node:path");
    if (id === "@freshgum/typedi") return { Service: () => (type) => type };
    if (id === "@root/helpers")
      return { StorageHelper: { clientsDir: "clients", profilesDir: "profiles" } };
    if (id === "./WatchService")
      return {
        WatchService: class {
          async subscribe(dir) {
            events.push(`subscribe:${dir}`);
            await pending;
          }
          async unsubscribe() {
            events.push("unsubscribe");
          }
        },
      };
    return new Proxy({}, { get: (_, name) => ({ name }) });
  });
  const watcher = new Watcher({}, {});
  const subscription = watcher.subscription();
  assert.equal(watcher.subscription(), subscription);
  const stop = watcher.stop();
  await nextTurn();
  assert(!events.includes("unsubscribe"));
  ready();
  await stop;
  const count = events.length;
  await watcher.subscription();
  assert.equal(events.length, count);
  assert.equal(events.filter((event) => event === "unsubscribe").length, 2);
});

test("closing WatchService cancels its delayed reload", async () => {
  const watcher = new EventEmitter();
  let closed = false;
  watcher.close = async () => {
    closed = true;
  };
  let cleared;
  const timer = {};
  const { WatchService } = loadSource(
    "components/watcher/WatchService.ts",
    (id) => {
      if (id === "chokidar") return { watch: () => watcher };
      return { LogHelper: { debug() {}, error() {} } };
    },
    {
      setTimeout: () => timer,
      clearTimeout: (value) => {
        cleared = value;
      },
    },
  );
  const service = new WatchService();
  const subscription = service.subscribe("clients", ".", () =>
    assert.fail("reload after shutdown"),
  );
  watcher.emit("ready");
  await subscription;
  watcher.emit("all", "change", "client/file.jar");
  await service.unsubscribe();
  assert.equal(cleared, timer);
  assert.equal(closed, true);
});
