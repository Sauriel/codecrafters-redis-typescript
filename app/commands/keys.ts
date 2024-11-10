import { Socket } from "net";

import type { PayloadType } from "../commandParser";
import RESPParser from "../respParser";
import { read } from "../fileUtils";
import CONFIG from "../config";

export default function keys(connection: Socket, payload: PayloadType) {
  const query = payload[0] as string;
  console.log(`Getting "${query}"`);
  const result = read(CONFIG.dir!, CONFIG.dbfilename!, query);
  connection.write(RESPParser.toArray(result.map(r => RESPParser.toBulkString(r))));
}