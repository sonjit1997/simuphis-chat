import { spawn } from "child_process";

console.log("🚀 Starting SimuPhish Real-Time Socket Server & Next.js...");

const socketServer = spawn("node", ["server/index.mjs"], {
  stdio: "inherit",
  shell: true,
});

const nextApp = spawn("next", ["dev", "--webpack"], {
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  socketServer.kill();
  nextApp.kill();
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
