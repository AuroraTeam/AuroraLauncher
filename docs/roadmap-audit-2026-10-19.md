# Сверка с Roadmap AuroraTeam

Дата: 19 октября 2026 года. Источник: [AuroraLauncher Функционал](https://github.com/orgs/AuroraTeam/projects/1), представление Roadmap.

Проверены 50 видимых карточек: 4 предложения, 7 в плане, 3 на обсуждении, 2 отложены, 11 в очереди, 3 в работе, 5 на тестировании, 15 в релизе. Для связанных задач прочитаны issue; для #87, #78, #70, #90, #71 и Launcher #44, #56 также комментарии. У публичных draft-карточек доступны названия; скрытые описания и архив проекта не проверены. Название задачи без критериев приёмки не позволяет однозначно подтвердить завершённость.

Сопоставление выполнено с локальными исходниками, включая текущие изменения пользователя. Дополнительно изучены соседние репозитории `D:/Projects/Aurora/AuroraModules`, `D:/Projects/Aurora/_Sites` (четыре сайта) и `D:/Projects/Aurora/EasyCabinet`. Уточнение автора: MySQL и другие БД должны поставляться модулями; отсутствие DB-провайдера в ядре соответствует плану и само по себе не является регрессией. Статусы доски взяты из исходной сверки; при расширении области проверки доска повторно не выгружалась. Для EasyCabinet #21 дополнительно прочитано описание issue.

Статус на доске не является подтверждением работоспособности этой версии. Установка игровых клиентов, публикация обновлений и проверки упакованных приложений на Windows/Linux/macOS не выполнялись. GitHub и исходники приложения не изменялись; обновлён только этот отчёт. Сайты проверены по локальным исходникам, а не по развёрнутым экземплярам.

## Вывод

Дорожная карта описывает реальную незавершённую разработку, но колонка «Релиз» частично отражает прошлые версии, а не состояние текущего кода. Главные расхождения: неполный цикл JSON-авторизации и несовместимость с текущим EasyCabinet; незавершённое подключение уже существующих исходников DB-модуля; не подтверждённая исправность Java, сборки и обновления. Модульное размещение БД соответствует принятой архитектуре. Наличие классов и интерфейсов не означает завершение соответствующих задач.

Исправление AcceptAuthProvider.invalidate подтверждено четырьмя изолированными проверками текущего класса после транспиляции TypeScript: совпавшая пара токенов, только accessToken, неизвестный токен, неверный clientToken. Совпавшая сессия удаляется, посторонняя сохраняется. Внешние зависимости заменены заглушками; сетевые запросы и изменения файлов не выполнялись.

Повторные проверки: сервер — 6 ошибок TypeScript в Forge/NeoForge; лаунчер — 12 ошибок TypeScript в Updater/MainPage; Vitest — одна упавшая suite, ноль активных тестов (Watcher.test.ts полностью закомментирован). На предыдущем этапе проверки core/api проходили. Полная сборка не подтверждена.

## Предложения — 4

| Карточка | Соответствие текущему коду |
| --- | --- |
| Перенос лаунчера на нормальный фрейм | Лаунчер остаётся на Electron/React. Критерии выбора другого фреймворка не заданы; это предложение, а не невыполненное обязательство текущего релиза. |
| Переписывание лаунчсервера на Go/Rust | Сервер написан на TypeScript/Node.js. Реализации на Go/Rust в workspace нет. |
| Добавить на сайт «Проекты которые используют наш лаунчер» | Теперь проверено: на aurora-launcher.ru такого блока/каталога нет. На aurora-team.ru перечислены собственные проекты команды (Aurora Launcher и Glacier), что не выполняет задачу о сторонних проектах-пользователях. Предложение не реализовано. |
| Интеграция OAuth2/OpenID | Встроенного потока OAuth2/OpenID не найдено; MicrosoftAuthProvider — заглушка. Внешние системы за JSON API не исследовались. |

## План — 7

| Карточка | Соответствие текущему коду |
| --- | --- |
| 2FA | Встроенного второго шага авторизации, challenge/OTP и соответствующего UI не найдено. |
| Возможность подрубить HWID баны | Сбора HWID и проверки запрета по нему не найдено. |
| Возможность ввода своей защиты по средствам модулей | Готового контракта подключения защиты не найдено. AuroraModules содержит example/db/webui, но их entrypoints — шаблоны Module с init(app: any). Загрузчик серверных модулей не подключён к обычному запуску; клиентский Watcher не заменяет модульный API. |
| Доработка рабочих процессов и структуры проекта | Частично: четыре workspace-пакета и pnpm есть. CI/Docker всё ещё используют npm и отсутствующий build:prod; нет общего обязательного прогона типизации/тестов. |
| Прокидывание аргументов вне строки запуска игры | Не реализовано: Starter передаёт JVM/game args в spawn; accessToken находится в аргументах процесса. |
| Рефакторинг модуля main/game лаунчера | Частично: есть Starter, Updater, JavaManager, GameService, Watcher. Остались ошибки типизации и управления асинхронными операциями; критериев завершения draft-карточки не видно. |
| [Перевести все пакеты на ESM #95](https://github.com/AuroraTeam/AuroraLauncher/issues/95) | Частично: core/api имеют type: module и format: esm. Сервер не задаёт ESM-формат и загружает модули через require; Electron main/упаковка также требуют согласованного перевода. AuroraModules тоже не задаёт ESM-формат. Среди сайтов API, документация и Astro-сайт уже имеют type: module; это не завершает перевод пакетов лаунчера. |

## Обсуждение/Утверждение — 3

| Карточка | Соответствие текущему коду |
| --- | --- |
| Фикс поиска офлайн никнеймов | Нельзя подтвердить по названию: не видны ожидаемые правила поиска. OfflineAuthProvider генерирует UUID из OfflinePlayer, ключа проекта и ника; AcceptAuthProvider использует другую схему UUID и запрашивает скины Mojang. Это ещё не доказывает описанный в карточке дефект. |
| Добавление lwjgl 2 arm версии | Специального подбора/замены LWJGL 2 для ARM не найдено. Поддержка ARM в загрузчике Java не решает подбор игровых native-библиотек. |
| [Отказ от поддержки 32-x битных систем #94](https://github.com/AuroraTeam/AuroraLauncher/issues/94) | Не завершён как общая политика: JavaManager/System и разрешение старых natives ещё содержат x32/32. Сборка серверных бинарников уже настроена на x64. Требуется решение о целевых платформах. |

## Отложено — 2

| Карточка | Соответствие текущему коду |
| --- | --- |
| [Интеграция Sentry #72](https://github.com/AuroraTeam/AuroraLauncher/issues/72) | Интеграции и конфигурации DSN не найдено. Соответствует отложенному статусу. |
| [Релиз v0.1 #18](https://github.com/AuroraTeam/AuroraLauncher/issues/18) | Откладывать обоснованно: чеклист отмечает авторизацию, сборку, обновление и Java выполненными, но текущий код не позволяет считать эти сценарии проверенными. Версии пакетов сервера/лаунчера остаются 0.0.5-dev.*. |

## В очереди на выполнение — 11

| Карточка | Соответствие текущему коду |
| --- | --- |
| [URL до injector API в авторизации #78](https://github.com/AuroraTeam/AuroraLauncher/issues/78) | Не завершено: InternalAuthProvider.injectorEndpoint жёстко равен api.web; LauncherRequest отдаёт только INTERNAL. Поля injectorEndpoint в интерфейсе и прокидывание в -javaagent уже есть, но настройки отдельного URL нет. Серверный Yggdrasil-провайдер не заменяет прямой выбор URL на клиенте. |
| Поддержка авторизации через Microsoft | Не реализовано: auth() возвращает Not implemented; refresh/verify/logout используют адрес authserver.mojang.com. Наличие класса не означает Microsoft-вход. |
| [Поддержка клиентов с Forge/NeoForged #70](https://github.com/AuroraTeam/AuroraLauncher/issues/70) | Частичная реализация есть. Обе установки подключены к downloadclient, но типизация не проходит. Forge выводит stdout в debug; обработчик stderr подписан на error вместо data. NeoForge подавляет вывод через stdio: ignore и не проверяет ненулевой status. Диапазон совместимости из issue не проверялся запуском игр. |
| [Конфликт разных версий библиотек #81](https://github.com/AuroraTeam/AuroraLauncher/issues/81) | Общего решения нет: Fabric/Quilt/NeoForge объединяют массивы; Forge имеет специальную обработку log4j. Версионные пути хранения позволяют иметь разные JAR на диске, но не решают конфликт в classpath одного профиля. |
| [Apple ARM для старых Minecraft #83](https://github.com/AuroraTeam/AuroraLauncher/issues/83) | Не завершено: правила платформ/архитектур есть, специальной замены старых LWJGL natives для Apple ARM не найдено. Нужны проверки на целевом устройстве. |
| [Переписать работу с TitleBar #93](https://github.com/AuroraTeam/AuroraLauncher/issues/93) | Частично: состояния уже вынесены в Jotai, компонент подписывается на атомы. Но сцены всё ещё вручную управляют флагами через useTitlebar; полного решения описанной проблемы управления состояниями не видно. |
| [Опциональные Моды #76](https://github.com/AuroraTeam/AuroraLauncher/issues/76) | Метаданных выбора, UI и применения пользовательского набора модов не найдено. updateExclusions не является системой опциональных модов. |
| [Fix 0day exploit log4j #90](https://github.com/AuroraTeam/AuroraLauncher/issues/90) | Не подтверждено: logging есть в интерфейсе Mojang, но не переносится в создаваемый профиль/аргументы запуска. Forge.fixLog4j заменяет библиотеки в частном сценарии и не доказывает выполнение задачи для всех версий. Нужна отдельная проверка мер для поддерживаемых игровых версий; эксплуатация уязвимости не проверялась. |
| [Вайт лист сборок #77](https://github.com/AuroraTeam/AuroraLauncher/issues/77) | Не реализовано: WhiteListManager пустой, поля профиля есть, фильтрации по UUID/permissions и интеграции с БД не найдено. |
| [Legacy ассеты #79](https://github.com/AuroraTeam/AuroraLauncher/issues/79) | Не реализовано: явный TODO в Starter.prestart, преобразования старого формата assets нет. |
| [Система модулей #96](https://github.com/AuroraTeam/AuroraLauncher/issues/96) (перенесена из Launcher #43) | По уточнению автора задача относится к серверу. Частично реализована: есть серверный ModulesManager и пакеты AuroraModules с init(app). Для завершения нужны подключение загрузчика при старте, согласованный контракт и порядок регистрации провайдеров, адаптация DB-модуля. Отсутствие клиентского загрузчика к этой задаче не относится. |

## В работе — 3

| Карточка | Соответствие текущему коду |
| --- | --- |
| [Правильная реализация автовхода #87](https://github.com/AuroraTeam/AuroraLauncher/issues/87) | Частично: токены сохраняются, есть validate/refresh. Но JSON-провайдер сервера эти методы не реализует; Login.initialize вызывается без catch; сбой получения настроек включает offline-провайдер, verify которого всегда true, даже для пустых сохранённых данных. Полного жизненного цикла сессии нет. HTTP-взаимодействие уже соответствует направлению, указанному в комментариях. |
| [Настройки по умолчанию для каждого клиента Launcher #44](https://github.com/AuroraTeam/Launcher/issues/44) | Частично: clients[{clientId,memory}] и чтение памяти по UUID в Starter есть; экран глобальных настроек продолжает читать/писать settings.memory, которого нет в типе. Дефолты на профиль и редактор пока не согласованы. Точный объём настроек в issue не определён. |
| [Вынести DatabaseAuthProvider в модули #75](https://github.com/AuroraTeam/AuroraLauncher/issues/75) | Перенос начат и соответствует плану: в AuroraModules/packages/db-module/src есть DatabaseAuthProvider и DatabasePasswordProvider. Интеграция не завершена: module.ts не импортирует/не регистрирует провайдер, содержит ExampleModule; остались отсутствующие импорты и старый auth(username,password) вместо authenticate(payload). Проверка TypeScript DB-модуля выдаёт 16 ошибок; загрузчик модулей сервера не подключён при старте. |

## Тестирование — 5

| Карточка | Соответствие текущему коду |
| --- | --- |
| [Сервер обновлений лаунчера #69](https://github.com/AuroraTeam/AuroraLauncher/issues/69) | Нужна доработка перед приёмкой. Upload использует multipart fieldname вместо filename; path.resolve не ограничен releaseDir; схема обмена с использованием публичного ключа не подтверждает полномочия издателя; upload-клиент не await-ит загрузки и расходится с маршрутами сервера по завершающему /. Раздача/потребление обновления целиком не проверены. |
| [Настройки лаунчера Launcher #42](https://github.com/AuroraTeam/Launcher/issues/42) | Базовые UI, IPC, хранилище и миграция есть. Экран памяти не согласован с моделью per-client; TypeScript выдаёт ошибки. Закрывать рано. |
| [Мультиязычность Launcher #51](https://github.com/AuroraTeam/Launcher/issues/51) | Основная реализация есть: i18next/react-i18next, ru-RU/en-US, переключатель. Остались жёстко заданные русские сообщения входа, трея и выбора каталога; сообщения игрового процесса заданы по-английски. Нужна проверка полноты переводов. |
| [Механизм установки Java Launcher #58](https://github.com/AuroraTeam/Launcher/issues/58) | Асинхронная распаковка реализована. Приёмку блокируют compareFileHash без await в двух местах и ранний успех при простом существовании javaDir: частичная установка не восстанавливается. Для Unix chmod получает десятичное 744, а не 0o744. |
| [Инициализация Java Launcher #56](https://github.com/AuroraTeam/Launcher/issues/56) | Достоверно считать исправленной нельзя: в комментариях связана с неполной распаковкой и #58; текущая проверка только наличия каталога сохраняет этот сценарий. Нужен повторный запуск после прерванной установки/повреждённого архива. |

## Релиз — 15

| Карточка | Соответствие текущему коду |
| --- | --- |
| [JSON-авторизация #24](https://github.com/AuroraTeam/AuroraLauncher/issues/24) | validate/refresh/invalidate безусловно бросают Error. После добавления EasyCabinet подтверждено ещё одно расхождение: сервер отправляет username и ожидает clientToken/selectedProfile, тогда как /aurora/auth кабинета принимает login и возвращает username/userUUID/accessToken. Документация также описывает старый формат. Прямое подключение по текущему README не соответствует новому контракту. |
| [MySQL-авторизация #25](https://github.com/AuroraTeam/AuroraLauncher/issues/25) | Работа с БД намеренно вынесена из ядра. Исходники DB-провайдера теперь доступны в AuroraModules; до готового подключаемого модуля перенос не доведён (#75). В EasyCabinet отдельно реализовано хранение пользователей через Prisma/MySQL; это не означает совместимость его JSON-авторизации с текущим сервером. |
| [Формат хранения клиентов #27](https://github.com/AuroraTeam/AuroraLauncher/issues/27) | Основное разделение assets/libraries/clients реализовано. В issue каталог называется instances; функциональное разделение соблюдено, название отличается. |
| [Проверка обновлений #28](https://github.com/AuroraTeam/AuroraLauncher/issues/28) | UpdateManager существует; добавленный API реализует /versions, stable/dev и данные артефактов, которые использует также сайт загрузок. Базовая структура ответа согласована. Краевой случай: API возвращает null для отсутствующего канала, а сервер ожидает string и передаёт значение в semver.gt. Замена реально запускаемого файла и развёрнутый API не проверялись. |
| [Authlib-injector #26](https://github.com/AuroraTeam/AuroraLauncher/issues/26) | Интеграция есть и включается через useInjector. Проверка хеша скачанного authlib.jar вызвана без await; ошибки загрузки поглощаются, verify сообщает успех. Требуется возврат на доработку надёжности. |
| [Зависимости EasyCabinet #21](https://github.com/AuroraTeam/EasyCabinet/issues/21) | Теперь проверено по смыслу issue: обязательность Redis/S3 снята. Кеш использует memory + файл при отсутствии REDIS_URL; FilesService по умолчанию сохраняет локально, Fastify раздаёт /uploads/. Redis и S3 остались опциями и npm-зависимостями — это не опровергает возможность запуска без этих сервисов. Статус «Релиз» обоснован на уровне исходников. |
| [DirWatcher #59](https://github.com/AuroraTeam/AuroraLauncher/issues/59) | Реализация есть: серверные Watcher/WatchService на chokidar и отдельный игровой Watcher клиента. Прямая строка запуска на сервере закомментирована, но Watcher создаётся DI-контейнером как зависимость DownloadClientCommand, который регистрируется при старте. Полностью отключённым считать нельзя. |
| [Автосинхронизация #71](https://github.com/AuroraTeam/AuroraLauncher/issues/71) | Реализована с риском неполной обработки: один debounce-таймер на всё дерево клиентов оставляет только последний path. Изменения двух сборок за 3 секунды могут привести к пересчёту лишь последней. В downloadclient не ожидаются closeWatcher/reloadProfiles/hashClients, нет finally для восстановления подписки после ошибки. |
| [Иконка в трее macOS #85](https://github.com/AuroraTeam/AuroraLauncher/issues/85) | Иконка создаётся через asset-путь и nativeImage, Tray есть. Исправность packaged-приложения на macOS не проверялась. Оснований автоматически переоткрывать именно исторический баг нет. |
| [Сборка Windows #86](https://github.com/AuroraTeam/AuroraLauncher/issues/86) | Сценарий упаковки есть. Текущая типизация лаунчера падает; полная Windows-сборка не выполнена. Это не доказывает возврат конкретного исторического бага, но готовность текущей сборки не подтверждена. |
| [Путь до Java Launcher #54](https://github.com/AuroraTeam/Launcher/issues/54) | getJavaPath реализован, но связанные #56/#58 ещё открыты. Из-за отсутствия восстановления неполной установки готовность сценария не подтверждена. |
| [Unix-бинарники #89](https://github.com/AuroraTeam/AuroraLauncher/issues/89) | Есть цели pkg для Linux/macOS, но упакованные файлы не запускались; сборка на node20 расходится с target node22 серверного кода. Нужен smoke-тест на каждой ОС; конкретный старый дефект не воспроизводился. |
| [Скины accept #73](https://github.com/AuroraTeam/AuroraLauncher/issues/73) | Реализация получения скина/плаща через Mojang и сохранения в сессии есть. Доступность внешнего сервиса и показ в игре не проверялись. |
| [Скины DB #74](https://github.com/AuroraTeam/AuroraLauncher/issues/74) | В DB-модуле сохранились вызовы SkinManager.getSkin/getCape, но импорт самого SkinManager отсутствует в добавленном комплекте. В EasyCabinet есть отдельная работающая по структуре цепочка skinHash/capeHash → FilesService → local/S3, но это другой компонент и он не завершает интеграцию DB-модуля. Рассматривать вместе с #75. |
| [Время в бинарных версиях #80](https://github.com/AuroraTeam/AuroraLauncher/issues/80) | LogHelper вручную форматирует дату, уменьшая зависимость основного логгирования от Intl. Но UpdateManager использует toLocaleString, а реальные pkg-бинарники не проверены. Полное соответствие не подтверждено. |

## Уточнение по модулям, сайтам и EasyCabinet

### AuroraModules

Репозиторий уже содержит три пакета: `db-module`, `example-module`, `webui-module`. Поэтому прежнее ограничение «исходники DB-модуля отсутствуют» снято. Состояние — начатый перенос, а не готовая поставка.

- В `db-module/src/DatabaseAuthProvider.ts` есть TypeORM-код поиска пользователей, проверки паролей, хранения accessToken и связывания игровой сессии. В конфигурации перечислены MySQL/MariaDB/PostgreSQL/SQLite/Oracle/MSSQL, но перечисление типов не является подтверждением установленного драйвера и проверенной работы каждой БД.
- `DatabasePasswordProvider.ts` содержит bcrypt/argon2 и составные хеши. Этот исходник не связан с entrypoint модуля; относительные импорты обоих DB-файлов ведут не в их фактическое расположение.
- `db-module/src/module.ts` остаётся ExampleModule с выводом app в консоль. Регистрации провайдера и импорта DB-кода нет. `tsup.config.ts` собирает только этот entrypoint: успешная сборка такого файла сама по себе не проверит неиспользуемый DB-провайдер.
- Пакеты db-module и example-module объявляют одно npm-имя `@aurora-modules/example-module`. У всех трёх классов Module одинаковые метаданные ExampleModule, включая WebUI. Нужны собственные имена и согласованный контракт загрузки.
- DB-пакет не объявляет импортируемые TypeORM/hash-wasm/aurora-rpc-server, зависит от core ^0.26.0 при текущем локальном core 1.0.0 и импортирует приватные серверные пути `@root/...`. Старый auth() и зависимость от SkinManager требуют адаптации к authenticate/validate/refresh/invalidate и текущей модели сессии.
- `webui-module` содержит init с выражением app; HTTP-маршрутов, UI и управления сервером в нём нет. Это заготовка WebUI, не готовая админ-панель.
- Серверный ModulesManager не вызывается при обычной инициализации. Даже после его подключения порядок должен позволять модулю зарегистрировать DB-провайдер до выбора config.auth.type. Сейчас registerAuthProviders выполняется раньше какого-либо модульного этапа.

Проверка: локальный TypeScript 5.8.3 из сервера запущен с `--noEmit --incremental false` и tsconfig DB-пакета; получено 16 диагностик, включая отсутствующие импорты, PromiseOr и незаданные поля. Ни одна БД не запускалась и подключение к ней не выполнялось. Задача системы модулей относится к серверу и перенесена автором из Launcher #43 в AuroraLauncher #96. Пример и WebUI подтверждают наличие заготовок, но не завершение серверного жизненного цикла модулей или контрактов защитных расширений.

### Сайты

- `aurora-launcher.ru` — Nuxt-сайт продукта: описание, преимущества, страница загрузки из `/versions`. Блок сторонних проектов-пользователей не найден. Значение «v0.1.0 is 82% complete» жёстко записано в шаблон и не связано с доской или проверками; его нельзя использовать как измерение готовности.
- `aurora-team.ru` — Astro-сайт команды: карточки собственных Aurora Launcher и Glacier. Эта витрина имеет другой смысл, чем задача о проектах, использующих лаунчер.
- `docs.aurora-launcher.ru` — VitePress, русская/английская документация, поиск и workflow публикации. Документация пока отражает старую архитектуру: auth.md обещает встроенный type: db и шесть БД без установки модуля; json-auth.md описывает login и плоский ответ, тогда как сервер уже ожидает username и authlib-подобный ответ. Нужны отдельные инструкции для актуальной версии, модулей и миграции.
- `api.aurora-launcher.ru` — Fastify/MongoDB, `/versions`, `/status`, `/gitwh`, `/mojang`, OpenAPI. Это центральный каталог версий LauncherServer и прокси Mojang; встроенный сервер релизов Electron-лаунчера из #69 остаётся другим механизмом. URL артефактов формируются как LauncherServer.js/-win.exe/-macos/-linux и соответствуют именам файлов в release workflow.

У API версий есть пункты для доработки: схема каналов объявляет string, но отсутствие версии возвращает null; webhook обновляет существующую версию и выходит до сброса кеша, а вставку новой записи не await-ит. Проверка подписи вычисляется по JSON.stringify(req.body), а не по исходным байтам запроса; при отличающейся сериализации корректное событие может быть проигнорировано. HTTP 202 отправляется ещё до проверки, поэтому сам по себе не подтверждает запись версии.

Проверка: `node --check` прошёл для всех 16 JS-файлов API. Это только синтаксис, не проверка Fastify, MongoDB, вебхука или развёрнутой службы. Зависимости сайтов не устанавливались, сборки Nuxt/Astro/VitePress и визуальная проверка страниц не выполнялись. Workflow публикации присутствуют у всех четырёх сайтов; фактическая успешность публикации не проверялась.

### EasyCabinet

Это самостоятельный личный кабинет с NestJS/Fastify backend, SolidJS/Vite frontend, Prisma/MySQL, регистрацией, входом, восстановлением пароля и загрузкой скинов/плащей. Его не следует считать самим DB-модулем LauncherServer.

Задача [EasyCabinet #21](https://github.com/AuroraTeam/EasyCabinet/issues/21) требует убрать обязательность Redis и S3. По исходникам это выполнено: при отсутствии REDIS_URL используется файловый кеш, при STORAGE_FORMAT=local (значение по умолчанию) изображения сохраняются на диск и раздаются Fastify. Дополнительные Redis/S3 зависимости сохраняют опциональные режимы; их наличие не является основанием переоткрывать задачу.

Главная проблема совместимости — протокол `/aurora/*`. JsonAuthProvider сервера без преобразования передаёт `{username,password,clientToken}`, а кабинет валидирует `{login,password}`. При успешном входе кабинет возвращает плоские `{username,userUUID,accessToken,...skinData}`, тогда как клиент через сервер получает и использует `{accessToken,clientToken,selectedProfile:{id,name}}`. Поэтому наличие обеих реализаций не подтверждает их прямую совместимость. JWT refresh/logout кабинета обслуживают его веб-сессии; AuroraController не предоставляет соответствующего нового игрового цикла сессий.

README кабинета тоже требует миграции: показывает `injector.skinDomains`, хотя текущий сервер использует `auth.skinDomains`. Полноценное подключение с регистрацией пользователя, входом из лаунчера, скином и перезапуском сессии не проверялось. Unit/e2e-тесты кабинета в этой сверке не запускались; изменения его БД не выполнялись.

Обновлённый порядок работ для этих компонентов: согласовать контракт модульного API и DB-провайдера; синхронизировать игровой JSON-протокол сервера/EasyCabinet/документации; проверить каталог версий и доставку релизов; затем актуализировать содержимое сайта. Существующие исходники позволяют продолжать перенос, но пока не позволяют объявить модуль БД и интеграцию кабинета готовыми.

## Доказательства в исходниках

Пути ниже указаны относительно корня проверяемого workspace.

- `packages/server/src/components/auth/providers/AcceptAuthProvider.ts:77`: исправленный invalidate.
- `packages/server/src/components/auth/providers/JsonAuthProvider.ts:34`: заглушки validate/refresh/invalidate.
- `packages/server/src/LauncherServer.ts`: регистрация провайдеров и команд; нет инициализации ModulesManager.
- `packages/server/src/components/commands/commands/basic/ModulesCommand.ts`: команда modules — заглушка.
- `packages/server/src/components/commands/commands/updates/DownloadClientCommand.ts:18`: Watcher подключён через DI; далее await отсутствует у операций остановки/пересинхронизации.
- `packages/server/src/components/watcher/WatchService.ts`: единый timer хранит только последний путь изменения.
- `packages/server/src/components/api/requests/release-server/DownloadReleaseRequest.ts:67`: путь из data.fieldname.
- `packages/server/src/components/api/requests/release-server/GetTokenRequest.ts`, `Token.ts`, `packages/launcher/script/upload-release.ts`: обмен токеном публикации.
- `packages/launcher/src/main/game/JavaManager.ts:17`: проверка только каталога; строки 52/64 — hash без await; строка 72 — chmod.
- `packages/launcher/src/main/game/AuthlibInjector.ts`: checksum без await; ошибки загрузки не блокируют успех verify.
- `packages/launcher/src/main/game/Starter.ts:255`: асинхронный forEach без ожидания распаковки natives; prestart может вернуть список раньше завершения. Это дополнительный риск запуска и Watcher, связанный с рефакторингом main/game.
- `packages/launcher/src/main/api/AuthorizationService.ts:43`: жизненный цикл автовхода и offline fallback.
- `packages/launcher/src/main/api/authProviders/InternalAuthProvider.ts:9`: endpoint равен api.web.
- `packages/server/src/components/api/requests/launcher/LauncherRequest.ts:14`: жёсткий INTERNAL.
- `packages/launcher/src/main/api/authProviders/MicrosoftAuthProvider.ts`: Not implemented.
- `packages/launcher/src/common/types.ts`, `packages/launcher/src/main/helpers/SettingsHelper.ts`, `packages/launcher/src/renderer/runtime/scenes/Settings/MainPage.tsx`: расхождение clients[].memory и settings.memory.
- `packages/server/src/components/download/DownloadManagers/{Mojang,Forge,NeoForge,Fabric,Quilt}.ts`: создание профилей, объединение библиотек, частичная обработка log4j.
- `packages/server/src/components/profiles/WhitelistManager.ts`: TODO.
- `Dockerfile`, `.github/workflows/{release,prerelease}.yml`, `packages/server/package.json`: устаревший build:prod, npm вместо pnpm.

Дополнительные репозитории (абсолютные пути):

- `D:/Projects/Aurora/AuroraModules/packages/db-module/src/{module,DatabaseAuthProvider,DatabasePasswordProvider}.ts`, `package.json`, `tsup.config.ts`: существующие DB-исходники, шаблонная точка входа, зависимости и сборка.
- `D:/Projects/Aurora/AuroraModules/packages/{example-module,webui-module}/src/module.ts`: метаданные и заготовки init.
- `D:/Projects/Aurora/_Sites/aurora-launcher.ru/pages/{index,download}.vue`: отсутствие каталога сторонних проектов, статический процент, каталог загрузок.
- `D:/Projects/Aurora/_Sites/aurora-team.ru/src/pages/index.astro`: собственные проекты команды.
- `D:/Projects/Aurora/_Sites/docs.aurora-launcher.ru/docs/ru/basic/auth.md`, `docs/ru/for-developers/json-auth.md`: устаревшая DB-конфигурация и старый игровой JSON-протокол.
- `D:/Projects/Aurora/_Sites/api.aurora-launcher.ru/src/modules/versions/{versions.service,versions.schemas}.js`, `src/modules/webhook/webhook.controller.js`: данные каналов, артефакты, webhook и кеш.
- `D:/Projects/Aurora/EasyCabinet/packages/backend/src/auth/auth.module.ts`, `src/files/files.service.ts`, `src/main.ts`: файловый кеш, local/S3, Fastify static.
- `D:/Projects/Aurora/EasyCabinet/packages/backend/src/aurora/{aurora.controller,aurora.service}.ts`, `src/auth/dto/login.dto.ts`, `README.md`: игровой JSON API и инструкция подключения.

## Рекомендуемая актуализация доски

1. Вернуть #24, #26 и #71 из «Релиз» в доработку с указанными сценариями отказа.
2. Явно связать #25/#74 с #75. Архитектурное решение принято: БД поставляются модулями из AuroraModules. Зафиксировать критерии готовности DB-модуля: отдельное имя пакета, корректные зависимости/импорты, новый AuthProvider, регистрация до выбора auth.type, проверенная матрица поддерживаемых драйверов и миграция документации.
3. Не принимать #69, Launcher #42/#58/#56 до устранения перечисленных ошибок.
4. Для #70 признать частичную реализацию; передвинуть в работу при возобновлении, указать проверяемую матрицу Minecraft/Forge/NeoForge и логирование установщиков.
5. Связать серверную систему модулей #96 (бывшая Launcher #43) с переносом DB-провайдера #75 и защитными расширениями. Согласовать общий серверный контракт и порядок инициализации; клиентскую модульную систему эта задача не требует.
6. Для #18 заменить исторический список наличия функций проверяемыми критериями: чистая типизация, установка с нуля, восстановление после обрыва, повторный вход, обновление между двумя версиями, запуск packaged-приложения на заявленных ОС.

Приоритет работ: публикация релизов и целостность загрузок; Java/natives и асинхронный запуск; авторизация и автовход; настройки на профиль; воспроизводимая сборка/CI; затем расширение возможностей. Вопрос обработки logging из #90 требует отдельной проверки для поддерживаемых версий до публичного релиза. Перенос на Go/Rust и другие предложения не являются необходимым условием стабилизации текущей архитектуры.
