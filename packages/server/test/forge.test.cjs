/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { loadSource } = require("./helpers/load-source.cjs");

function loadManager(file, { files = {}, http = {} } = {}) {
  const errors = [];
  const exports = loadSource(`components/download/DownloadManagers/${file}.ts`, (id) => {
    if (id === "fs") return { ...require("node:fs"), ...files };
    if (id === "@freshgum/typedi") return { Service: () => (type) => type };
    if (id === "@aurora-launcher/core")
      return { JsonHelper: { parse: JSON.parse }, HttpHelper: http };
    if (id === "@root/helpers")
      return {
        LogHelper: { info() {}, error() {}, debug: (error) => errors.push(error) },
        StorageHelper: { getTmpPath: () => "/tmp/forge-test" },
      };
    if (id === "./Mojang")
      return {
        MojangManager: class {
          constructor(langManager, profilesManager) {
            Object.assign(this, { langManager, profilesManager });
          }
          async downloadClient() {
            return "profile-id";
          }
        },
      };
    return require(id);
  });
  return { ...exports, errors };
}

const library = (name, version = "1") => ({
  path: `${name}/${version}/${name}-${version}.jar`,
  sha1: version,
  type: "library",
});

test("Forge independently replaces both Log4j artifacts without dropping another library", () => {
  const { ForgeManager } = loadManager("Forge");
  const manager = new ForgeManager();
  const unrelated = library("example");
  const base = Object.freeze([library("log4j-api"), unrelated, library("log4j-core")]);
  const additions = Object.freeze([
    library("forge"),
    library("log4j-core", "2"),
    library("log4j-api", "2"),
  ]);
  const result = manager.fixLog4j(base, additions);
  assert.deepEqual(
    Array.from(result, (entry) => entry.path),
    [additions[2].path, unrelated.path, additions[1].path, additions[0].path],
  );
});

test("Forge handles one replacement, absent old artifacts and no replacements", () => {
  const { ForgeManager } = loadManager("Forge");
  const manager = new ForgeManager();
  const api = library("log4j-api");
  const core = library("log4j-core");
  const updatedCore = library("log4j-core", "2");
  const other = library("example");
  assert.deepEqual(Array.from(manager.fixLog4j([api, core, other], [updatedCore])), [
    api,
    updatedCore,
    other,
  ]);
  assert.deepEqual(Array.from(manager.fixLog4j([other], [updatedCore])), [other, updatedCore]);
  assert.deepEqual(Array.from(manager.fixLog4j([api, core], [other])), [api, core, other]);
});

test("missing Forge version is rejected before any installer download", async () => {
  const { ForgeManager, errors } = loadManager("Forge", {
    http: { getResourceFromJson: async () => ({ data: [] }) },
  });
  assert.equal(await new ForgeManager().downloadForge("1.20.1"), false);
  assert.match(errors[0].message, /Forge installer not found/);
});

test("missing base profile gives a useful error instead of accessing undefined libraries", async () => {
  const { ForgeManager } = loadManager("Forge", {
    files: { readFileSync: () => Buffer.from('{"libraries":[]}') },
  });
  const manager = new ForgeManager(
    { getTranslate: { DownloadManager: { ForgeManager: { client: { install: "installing" } } } } },
    { getProfiles: () => [] },
  );
  manager.downloadForge = async () => true;
  manager.startInstallerFile = async () => {};
  manager.libParser = () => [];
  manager.libCopy = () => {};
  await assert.rejects(
    manager.downloadClient("1.20.1", "test"),
    /Minecraft profile not found: profile-id/,
  );
});

test("empty NeoForge client directory gives an explicit error", () => {
  const { NeoForgeManager } = loadManager("NeoForge", {
    files: {
      readFileSync: () => Buffer.from('{"libraries":[]}'),
      readdirSync: () => [],
    },
  });
  assert.throws(() => new NeoForgeManager().libParser([]), /Minecraft client directory missing/);
});
