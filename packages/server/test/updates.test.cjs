/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fastify = require('fastify');
const { loadSource } = require('./helpers/load-source.cjs');

test('/updates distinguishes a missing client from an empty client and validates input', async () => {
    const { UpdatesRequest } = loadSource('components/api/requests/launcher/UpdatesRequest.ts', (id) => {
        if (id === '@aurora-launcher/core') return { UPDATES_METHOD: '/updates' };
        if (id === '@freshgum/typedi') return { Service: () => (type) => type };
        return {};
    }, { Error });
    const files = [{ path: '/full/game.jar', size: 42, sha1: 'hash' }];
    const route = new UpdatesRequest({ hashedClients: new Map([['empty', []], ['full', files]]) });
    const app = fastify();
    app.post(route.url, { schema: route.schema }, route.handler.bind(route));
    try {
        for (const [dir, expected] of [['empty', []], ['full', files]]) {
            const response = await app.inject({ method: 'POST', url: '/updates', payload: { dir } });
            assert.equal(response.statusCode, 200);
            assert.deepEqual(response.json(), expected);
        }
        const missing = await app.inject({ method: 'POST', url: '/updates', payload: { dir: 'absent' } });
        assert.equal(missing.statusCode, 404);
        assert.equal(missing.json().message, 'Client not found');
        for (const payload of [{}, { dir: '' }]) {
            const response = await app.inject({ method: 'POST', url: '/updates', payload });
            assert.equal(response.statusCode, 400);
        }
    } finally {
        await app.close();
    }
});
