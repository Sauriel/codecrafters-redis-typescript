import { Socket } from "net";

import type { PayloadType } from "../commandParser";
import RESPParser from "../respParser";
import { findKeys } from "../fileUtils";

export default function keys(connection: Socket, payload: PayloadType) {
  const query = payload[0] as string;
  console.log(`Getting "${query}"`);
  const result = findKeys(query);
  connection.write(RESPParser.toArray(result.map(r => RESPParser.toBulkString(r))));
}