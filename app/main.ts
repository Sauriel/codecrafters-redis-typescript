import { parseArgs } from "util";
import { Server, createServer, Socket} from "net";
import RESPParser from "./respParser";
import CommandParser from "./commandParser";
import execute from "./commands";
import CONFIG from "./config";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    dir: {
      type: 'string',
    },
    dbfilename: {
      type: 'string',
    },
  },
  strict: true,
  allowPositionals: true,
});

if (values.dir) {
  console.log(`arg --dir set to "${values.dir}"`);
  CONFIG.set("dir", values.dir);
}

if (values.dbfilename) {
  console.log(`arg --dbfilename set to "${values.dbfilename}"`);
  CONFIG.set("dbfilename", values.dbfilename);
}

const server: Server = createServer((connection: Socket) => {
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
