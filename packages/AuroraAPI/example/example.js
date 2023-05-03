import { AuroraAPI } from "../dist/aurora-api-web.js"

// User data
const wsUrl = "ws://localhost:1370/ws"

// Log helper
const log = {
    append(message) {
        document.getElementById("log").append(`${message}\n`)
    },
    appendData(data) {
        this.append(JSON.stringify(data))
    },
}

// Api usage example
;(async () => {
    let api
    try {
        api = new AuroraAPI(wsUrl, {
            onOpen: () => {
                log.append("Соединение установлено")
            },
            onClose: (event) => {
                if (event.wasClean) return log.append("Соединение закрыто")
                if (event.code === 1006) log.append("Разрыв соединения")
            },
            onError: () => {
                log.append("Ошибка при подключении!")
            },
        })
        await api.connect()
        const test = await api.getServers()
        log.appendData(test)
    } catch (error) {
        log.appendData(error)
    } finally {
        api.close()
    }
})()
