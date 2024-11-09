import * as net from "net";

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (buffer: Buffer) => {
    const data = buffer.toString();

    for (let i = 0; i < data.split("PING").length - 1; i++) {
      console.log("Sending PONG ...");
      connection.write("+PONG\r\n");
    }
  });
});

server.listen(6379, "127.0.0.1");
