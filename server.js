const path = require("path");
const cp = require("child_process");

const tsc = path.join(path.dirname(require.resolve("typescript")), "tsc.js");
const out = cp.spawnSync("node", [tsc, "-p",  "."], {
  stdio: "inherit"
});
if (out.status === 0) {
  require("./build/src");
} else {
  process.exit(-1);
}
