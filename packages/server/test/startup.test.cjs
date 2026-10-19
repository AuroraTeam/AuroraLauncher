/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");
const { loadSource } = require("./helpers/load-source.cjs");

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const nextTurn = () => new Promise(setImmediate);

function createServer({ gates = {}, failAt } = {}) {
  const events = [];
  const errors = [];
  const failure = new Error(`Failure at ${failAt}`);
  const run = async (phase) => {
    events.push(phase);
    if (gates[phase]) await gates[phase];
    if (failAt === phase) throw failure;
    events.push(`${phase}.ready`);
  };
  const services = {
    ProfilesManager: { init: () => run("profiles") },
    ClientsManager: { init: () => run("clients") },
    WebServerManager: {
      init: () => run("web"),
      registerRequest: () => events.push("route"),
      start: () => run("listen"),
      stop: () => run("web.stop"),
    },
    Watcher: {
      subscription: () => run("watch"),
      stop: () => run("watch.stop"),
    },
    CommandsManager: {
      registerCommands: () => events.push("commands.register"),
      start: () => events.push("commands.start"),
      stop: () => events.push("commands.stop"),
    },
    UpdateManager: { checkUpdate: () => run("updates"), stop: () => run("updates.stop") },
  };
  const { LauncherServer } = loadSource("LauncherServer.ts", (id) => {
    if (id === "@freshgum/typedi") {
      return { Container: { get: (token) => services[token.name] ?? {}, set() {} } };
    }
    if (id === "./helpers") {
      return { LogHelper: { printVersion() {}, error: (error) => errors.push(error) } };
    }
    if (id.endsWith("/AuthManager")) {
      return { AuthManager: { registerProviders() {}, getProvider: () => ({}) } };
    }
    // Route/command imports act as DI tokens; their implementations aren't executed.
    if (id.startsWith("./components/") || id === "./tokens") {
      return new Proxy({}, { get: (_, name) => ({ name }) });
    }
    throw new Error(`Unexpected import: ${id}`);
  });
  return { server: new LauncherServer(), events, errors, failure, services };
}

test("startup awaits data, HTTP initialization, listen and Watcher readiness", async () => {
  const profiles = deferred();
  const web = deferred();
  const listen = deferred();
  const watch = deferred();
  const { server, events } = createServer({
    gates: {
      profiles: profiles.promise,
      web: web.promise,
      listen: listen.promise,
      watch: watch.promise,
    },
  });

  assert.deepEqual(events, [], "construction must not start services");
  const start = server.start();
  assert.equal(server.start(), start, "concurrent callers share startup");
  assert.deepEqual(events, ["profiles"]);

  profiles.resolve();
  await nextTurn();
  assert(events.includes("clients.ready"));
  assert(events.includes("web"));
  assert(!events.includes("route"), "routes wait for HTTPS setup");
  assert(!events.includes("listen"));

  web.resolve();
  await nextTurn();
  assert(events.includes("route"));
  assert(events.includes("listen"));
  assert(!events.includes("watch"));
  assert(!events.includes("commands.start"));

  listen.resolve();
  await nextTurn();
  assert(events.includes("watch"));
  assert(!events.includes("commands.start"));

  watch.resolve();
  await start;
  assert(events.indexOf("watch.ready") < events.indexOf("commands.start"));
  assert(events.indexOf("commands.start") < events.indexOf("updates"));
  await server.stop();
});

for (const phase of ["profiles", "clients", "web", "listen", "watch"]) {
  test(`failure during ${phase} rejects startup and releases acquired resources`, async () => {
    const { server, events, failure } = createServer({ failAt: phase });
    await assert.rejects(server.start(), (error) => error === failure);
    assert(!events.includes("commands.start"));
    assert(!events.includes("updates"));
    if (["web", "listen", "watch"].includes(phase)) assert(events.includes("web.stop.ready"));
    if (phase === "watch") assert(events.includes("watch.stop.ready"));
    if (phase === "listen") assert(!events.includes("watch"));
  });
}

test("optional update check failure does not fail startup", async () => {
  const { server, errors, failure } = createServer({ failAt: "updates" });
  await server.start();
  await nextTurn();
  assert.deepEqual(errors, [failure]);
  await server.stop();
});

test("shutdown waits for cleanup and concurrent/repeated calls share the same result", async () => {
  const closing = deferred();
  const { server, events } = createServer({ gates: { "web.stop": closing.promise } });
  await server.start();
  const stop = server.stop();
  assert.equal(server.stop(), stop);
  await nextTurn();
  assert(events.includes("commands.stop"));
  assert(events.includes("watch.stop.ready"));
  assert(!events.includes("web.stop.ready"));
  closing.resolve();
  await stop;
  await server.stop();
  for (const phase of ["commands.stop", "watch.stop", "web.stop", "updates.stop"]) {
    assert.equal(events.filter((event) => event === phase).length, 1);
  }
});

for (const phase of ["profiles", "clients", "web", "listen", "watch"]) {
  test(`shutdown during ${phase} waits for that phase and prevents further startup`, async () => {
    const pending = deferred();
    const { server, events } = createServer({ gates: { [phase]: pending.promise } });
    const start = server.start();
    await nextTurn();
    assert(events.includes(phase));
    const stop = server.stop();
    await nextTurn();
    assert(!events.includes("web.stop"));
    pending.resolve();
    await Promise.all([start, stop]);
    assert(!events.includes("commands.start"));
    assert(!events.includes("updates"));
    if (["web", "listen", "watch"].includes(phase)) assert(events.includes("web.stop.ready"));
    if (phase === "watch") assert(events.includes("watch.stop.ready"));
  });
}

test("shutdown tries every resource even if synchronous and asynchronous cleanup fail", async () => {
  const { server, events, services } = createServer({ failAt: "web.stop" });
  await server.start();
  services.CommandsManager.stop = () => {
    throw new Error("Console close failed");
  };
  await assert.rejects(
    server.stop(),
    (error) => error.name === "AggregateError" && error.errors.length === 2,
  );
  assert(events.includes("watch.stop.ready"));
  assert(events.includes("updates.stop.ready"));
});

test("cleanup failure preserves the original startup error", async () => {
  const { server, services, failure, errors } = createServer({ failAt: "listen" });
  services.WebServerManager.stop = async () => {
    throw new Error("HTTP close failed");
  };
  await assert.rejects(server.start(), (error) => error === failure);
  assert.equal(errors[0].name, "AggregateError");
});

test("a server stopped before startup cannot acquire resources", async () => {
  const { server, events } = createServer();
  await server.stop();
  await assert.rejects(server.start(), /Cannot start a stopped/);
  assert.deepEqual(events, []);
});

test("HTTPS initialization waits for both files and propagates listen failure", async () => {
  const cert = deferred();
  const key = deferred();
  const failure = new Error("EADDRINUSE");
  let options;
  let fileReads = 0;
  const { WebServerManager } = loadSource("components/api/ApiManager.ts", (id) => {
    if (id === "fs/promises")
      return { readFile: () => (++fileReads === 1 ? cert.promise : key.promise) };
    if (id === "path") return path;
    if (id === "@freshgum/typedi") return { Service: () => (type) => type };
    if (id === "@root/helpers") return { StorageHelper: { storageDir: "/storage" } };
    if (id === "fastify")
      return (config) => {
        options = config;
        return {
          route() {},
          async listen() {
            throw failure;
          },
          async close() {},
        };
      };
    if (id.startsWith("@fastify/")) return () => {};
    if (id.startsWith("../")) return new Proxy({}, { get: (_, name) => ({ name }) });
    throw new Error(`Unexpected import: ${id}`);
  });
  const manager = new WebServerManager(
    {
      config: {
        api: {
          useSSL: true,
          ssl: { cert: "cert.pem", key: "key.pem" },
          disableListing: true,
        },
      },
    },
    { getTranslate: { WebServerManager: {} } },
  );
  assert.equal(fileReads, 0);
  const init = manager.init();
  cert.resolve(Buffer.from("cert"));
  await nextTurn();
  assert.equal(options, undefined);
  key.resolve(Buffer.from("key"));
  await init;
  assert.equal(options.https.cert.toString(), "cert");
  assert.equal(options.https.key.toString(), "key");
  manager.registerRequest({ method: "GET", url: "/", handler() {} });
  await assert.rejects(manager.start(), (error) => error === failure);
  await manager.stop();
});
