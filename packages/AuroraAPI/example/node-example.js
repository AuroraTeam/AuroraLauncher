const { AuroraAPI } = require("../dist/aurora-api-node.cjs")

// User data
const wsUrl = "ws://localhost:1370/ws"

// Api usage example
;(async () => {
    let api
    try {
        api = new AuroraAPI(wsUrl)
        await api.connect()
        const test = await api.getServers()
        console.log(test)
    } catch (error) {
        console.error(error)
    } finally {
        api.close()
    }
})()
