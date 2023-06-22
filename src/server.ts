import { Server, WebSocket } from "ws";

type Socket = {
  isAlive: boolean;
} & WebSocket;

const wss = new Server({
  port: 8080,
});

wss.on("connection", (ws: Socket) => {
  ws.isAlive = true;

  ws.on("pong", () => (ws.isAlive = true));
  ws.on("error", console.error);

  ws.on("message", (data, isBinary) => {
    console.log("received: %s", data);
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});

const interval = setInterval(() => {
  (wss.clients as Set<Socket>).forEach(ws => {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 10000);

wss.on("close", () => {
  clearInterval(interval);
});

console.log("Server started on port 8080");
