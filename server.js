const cp = require("child_process");

cp.execSync("npm run build-server");

require("./build/src");