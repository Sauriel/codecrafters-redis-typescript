import * as net from "net";
import RESPParser from "./respParser";
import CommandParser from "./commandParser";
import execute from "./commands";

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (buffer: Buffer) => {
    const data = buffer.toString();
    console.log("Got data: ", [data]);
    const parsed = RESPParser.parse(buffer);

    const command = CommandParser.parseRESP(parsed);
    console.log(command);
    execute(connection, command);
  });
});

server.listen(6379, "127.0.0.1");
