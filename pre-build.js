const rimraf = require("rimraf");
const path = require("path");

rimraf(path.resolve(__dirname, "dist"), e => {
    if (e) throw e;
    console.log("success");
});