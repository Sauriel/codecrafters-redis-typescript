import * as net from "net";

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    const dataString = data.toString();
    if (dataString.includes("PING")) {
      console.log(`data received "${data.toString()}"`);
      connection.write("+PONG\r\n");
    }
  });
});

server.listen(6379, "127.0.0.1");
