const http = require("http");
const os = require("os");
http.createServer((req, res) => {
  res.writeHead(200, {"Content-Type": "text/html"});
  res.end("<h1>BlackRoad " + os.hostname() + "</h1><p>Load: " + os.loadavg()[0] + "</p>");
}).listen(3000, "0.0.0.0");
