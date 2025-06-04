export function IndexRequest(req, rep) {
    if (req.headers["user-agent"]?.startsWith("Java")) {
        rep.header("X-Authlib-Injector-API-Location", "/authlib");
        return rep.send();
    }

    const { useSSL } = this.configManager.config.api;
    rep.redirect(`http${useSSL ? "s" : ""}://${req.headers.host}/files/`, 301);
    rep.send();
}
