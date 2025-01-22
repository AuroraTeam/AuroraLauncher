FROM node:22-slim AS build
WORKDIR /build
COPY . .
RUN npm i &&\
    npm run build:libs &&\
    npm run build:prod -w packages/server

FROM node:22-slim AS prod
EXPOSE 1370/tcp
VOLUME [ "/data" ]
ENV AURORA_STORAGE_OVERRIDE=/data
WORKDIR /app
COPY --from=build /build/packages/server/dist/LauncherServer.js .

ENTRYPOINT ["node", "LauncherServer.js"]
