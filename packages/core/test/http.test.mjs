import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { MockAgent, getGlobalDispatcher, setGlobalDispatcher } from "undici";

import { HttpHelper } from "../dist/index.mjs";

const sha1 = (data) => createHash("sha1").update(data).digest("hex");
async function setup(t) {
    const dir = await mkdtemp(join(process.cwd(), ".http-test-"));
    const original = getGlobalDispatcher();
    const agent = new MockAgent();
    agent.disableNetConnect();
    setGlobalDispatcher(agent);
    t.after(async () => {
        setGlobalDispatcher(original);
        await agent.close();
        await rm(dir, { recursive: true, force: true });
    });
    return { dir, target: join(dir, "game.jar"), pool: agent.get("https://files.test") };
}

test("publishes only verified data and accepts uppercase SHA-1", async (t) => {
    const { dir, target, pool } = await setup(t);
    await writeFile(target, "previous");
    pool.intercept({ path: "/file" }).reply(200, "replacement");
    await HttpHelper.downloadSafeFile("https://files.test/file", target, {
        sha1: sha1("replacement").toUpperCase(),
    });
    assert.equal(await readFile(target, "utf8"), "replacement");
    assert.deepEqual(await readdir(dir), ["game.jar"]);
});

test("bad hashes and HTTP errors preserve the old file, clean staging and allow retry", async (t) => {
    const { dir, target, pool } = await setup(t);
    await writeFile(target, "previous");
    pool.intercept({ path: "/file" }).reply(200, "corrupt");
    pool.intercept({ path: "/file" }).reply(404, "missing");
    pool.intercept({ path: "/file" }).reply(200, "replacement");
    for (const failure of [/SHA-1 mismatch/, /status code 404/]) {
        await assert.rejects(
            HttpHelper.downloadSafeFile("https://files.test/file", target, {
                sha1: sha1("replacement"),
            }),
            failure,
        );
        assert.equal(await readFile(target, "utf8"), "previous");
        assert.deepEqual(await readdir(dir), ["game.jar"]);
    }
    await HttpHelper.downloadSafeFile("https://files.test/file", target, {
        sha1: sha1("replacement"),
    });
    assert.equal(await readFile(target, "utf8"), "replacement");
});

test("invalid checksum does not publish a missing file", async (t) => {
    const { dir, target, pool } = await setup(t);
    await assert.rejects(
        HttpHelper.downloadSafeFile("https://files.test/file", target, { sha1: "bad" }),
        /Invalid SHA-1/,
    );
    pool.intercept({ path: "/file" }).reply(200, "corrupt");
    await assert.rejects(
        HttpHelper.downloadSafeFile("https://files.test/file", target, { sha1: sha1("expected") }),
        /SHA-1 mismatch/,
    );
    assert.deepEqual(await readdir(dir), []);
});

test("relative redirects are followed and redirect loops fail without replacing a file", async (t) => {
    const { dir, target, pool } = await setup(t);
    pool.intercept({ path: "/start" }).reply(302, "", { headers: { location: "/final" } });
    pool.intercept({ path: "/final" }).reply(200, "data");
    await HttpHelper.downloadSafeFile("https://files.test/start", target, { sha1: sha1("data") });
    pool.intercept({ path: "/loop" })
        .reply(302, "", { headers: { location: "/loop" } })
        .persist();
    await assert.rejects(
        HttpHelper.downloadSafeFile("https://files.test/loop", target),
        /redirects/,
    );
    assert.equal(await readFile(target, "utf8"), "data");
    assert.deepEqual(await readdir(dir), ["game.jar"]);
});

test("a response stream interrupted after partial data rejects and removes staging", async (t) => {
    const { dir, target } = await setup(t);
    await writeFile(target, "previous");
    setGlobalDispatcher({
        dispatch(_options, handler) {
            handler.onConnect(() => {});
            handler.onHeaders(200, [], () => {}, "OK");
            handler.onData(Buffer.from("partial"));
            setImmediate(() => handler.onError(new Error("connection interrupted")));
            return true;
        },
    });
    await assert.rejects(
        HttpHelper.downloadSafeFile("https://files.test/file", target, { sha1: sha1("complete") }),
        /connection interrupted/,
    );
    assert.equal(await readFile(target, "utf8"), "previous");
    assert.deepEqual(await readdir(dir), ["game.jar"]);
});

test("concurrent downloads use independent staging directories", async (t) => {
    const { dir, target, pool } = await setup(t);
    pool.intercept({ path: "/one" }).reply(200, "same");
    pool.intercept({ path: "/two" }).reply(200, "same");
    await Promise.all(
        ["one", "two"].map((name) =>
            HttpHelper.downloadSafeFile(`https://files.test/${name}`, target, {
                sha1: sha1("same"),
            }),
        ),
    );
    assert.equal(await readFile(target, "utf8"), "same");
    assert.deepEqual(await readdir(dir), ["game.jar"]);
});

test("a failed publication cleans staging without deleting the destination", async (t) => {
    const { dir, target, pool } = await setup(t);
    await mkdir(target);
    await writeFile(join(target, "keep"), "previous");
    pool.intercept({ path: "/file" }).reply(200, "verified");
    await assert.rejects(
        HttpHelper.downloadSafeFile("https://files.test/file", target, { sha1: sha1("verified") }),
    );
    assert.equal(await readFile(join(target, "keep"), "utf8"), "previous");
    assert.deepEqual(await readdir(dir), ["game.jar"]);
});
