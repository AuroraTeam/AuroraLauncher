// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parentPort } = require('worker_threads');

parentPort.on('message', (task) => {
    const result = eval(task);
    parentPort.postMessage(result);
});
