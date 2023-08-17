// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parentPort } = require("worker_threads");

parentPort.on('message', async (message) => {
    if (message.type === 'task') {
        const { taskId, task } = message;
        try {
            const result = await task();
            parentPort.postMessage({ taskId, data: result });
        } catch (error) {
            parentPort.postMessage({ taskId, error: error.message });
        }
    } else if (message.type === 'terminate') {
        process.abort();
    }
});
