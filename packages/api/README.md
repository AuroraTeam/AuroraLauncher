#  AuroraLauncherAPI (@aurora-launcher/api)

Реализация JS / TS API для [Aurora Launcher](https://github.com/AuroraTeam/AuroraLauncher)

## Установка

Используя npm:

```bash
npm i @aurora-launcher/api
```

Используя jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@aurora-launcher/api/dist/index-web.js"></script>
```

Используя unpkg CDN:

```html
<script src="https://unpkg.com/@aurora-launcher/api/dist/index-web.js"></script>
```

## Пример использования (Node.js)

```js
// Подключение класса API
const { AuroraAPI } = require('@aurora-launcher/api');

// Инициализация класса API и создание подключения к вебсокету
const api = new AuroraAPI('ws://localhost:1370/ws');

// Отправка/обработка запросов в стиле Promise

api.ready() // Ожидание подключения к сокету лаунчсервера
.then(() => {
    api.send('ping').then(result => { // Запрос к API лаунчер сервера
        console.log(result);
    }).catch((error) => {
        console.error(error);
    });
    api.close(); // Закрытие соединения
}).catch((error) => {
    console.error(error);
});

// или в стиле async/await

await api.ready();
try {
    const result = await api.send('ping');
    console.log(result);
} catch (error) {
    console.error(error);
} finally {
    api.close();
}
```

Также библиотека поддерживает работу с TypeScript

<!-- Более подробные примеры использования можно найти [здесь](https://github.com/AuroraTeam/AuroraAPI/tree/master/example) -->

## Методы и параметры

Класс `AuroraAPI` содержит следущее:

Методы:

-   `ready()` - функция ожидания подключения к сокету лаунчсервера
-   `close()` - отключение от сокета лаунчсервера
-   `hasConnected()` - проверка на наличие подключения к сокету лаунчер серверу
-   `send(type, obj)` - отправка запроса к лаунчсерверу, где:
    -   `type` - тип запроса
    -   `obj` - объект с параметрами запроса

Эвенты (стандартные эвенты [вебсокета](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)):

-   `onOpen()` - обработчик эвента [onopen](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/onopen)
-   `onClose()` - обработчик эвента [onclose](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/onclose)
-   `onMessage()` - обработчик эвента [onmessage](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/onmessage)
-   `onError()` - обработчик эвента [onerror](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/onerror)
