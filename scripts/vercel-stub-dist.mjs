import fs from "node:fs";

fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync(
  "dist/index.html",
  `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>FitBot API</title></head>
<body><p>FitBot backend. <a href="/api/health">/api/health</a></p></body>
</html>`,
);
