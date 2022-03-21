const redis = require("redis");
const manipulaLista = require("./manipula-lista");
const allowList = redis.createClient({ prefix: "allowlist-refresh-token:" });
allowList.on("connect", () => console.log("Connected to Redis!"));
allowList.on("error", (err) => console.log("Redis Client Error", err));
allowList.connect();

module.exports = manipulaLista(allowList);
