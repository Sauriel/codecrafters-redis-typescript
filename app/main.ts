import * as net from "net";
import RESPParser from "./respParser";
import CommandParser from "./commandParser";

const RESP_PARSER = new RESPParser();
const COMMAND_PARSER = new CommandParser();

const DB = new Map<string, string>();

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (buffer: Buffer) => {
    const data = buffer.toString();
    const parsed = RESP_PARSER.parse(buffer);
    // console.log("Got data: ", parsed);

    const command = COMMAND_PARSER.parseRESP(parsed);
    console.log(command);
    switch (command.type) {
      case "ping":
        console.log("Sending PONG...");
        connection.write("+PONG\r\n");
        break;
      case "echo":
        const payload = command.payload[0] as string;
        console.log(`Echoing "${payload}"`);
        connection.write(RESP_PARSER.toBulkString(payload));
        break;
      case "set":
        const key = command.payload[0] as string;
        const value = command.payload[1] as string;
        console.log(`setting "${key}" to "${value}"`);
        DB.set(key, value);
        connection.write(RESP_PARSER.toSimpleString("OK"));
        break;
      case "get":
        const getKey = command.payload[0] as string;
        console.log(`getting "${getKey}"`);
        connection.write(RESP_PARSER.toBulkString(DB.get(getKey)));
        break;
    }
  });
});

server.listen(6379, "127.0.0.1");
