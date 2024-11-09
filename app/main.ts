import * as net from "net";
import RESPParser from "./respParser";
import CommandParser from "./commandParser";

const RESP_PARSER = new RESPParser();
const COMMAND_PARSER = new CommandParser();

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (buffer: Buffer) => {
    const data = buffer.toString();
    const parsed = RESP_PARSER.parse(buffer);
    console.log("Got data: ", parsed);

    const command = COMMAND_PARSER.parseRESP(parsed);
    switch (command.type) {
      case "ping":
        console.log("Sending PONG...");
        connection.write("+PONG\r\n");
        break;
      case "echo":
        const payload = command.payload as string;
        console.log(`Echoing ${payload}`);
        connection.write(RESP_PARSER.stringToRESP(payload));
    }

    for (let i = 0; i < data.split("PING").length - 1; i++) {
      console.log("Sending PONG ...");
      connection.write("+PONG\r\n");
    }
  });
});

server.listen(6379, "127.0.0.1");
