import * as net from "net";

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    const dataString = data.toString();

    for (let i = 0; i < dataString.split("PING").length - 1; i++) {
      connection.write("+PONG\r\n");
    }
  });
});

server.listen(6379, "127.0.0.1");
