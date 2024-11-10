import { Socket } from "net";

import type { PayloadType } from "../commandParser";
import RESPParser from "../respParser";
import DB from "../database";

export default function get(connection: Socket, payload: PayloadType) {
  const key = payload[0] as string;
  console.log(`getting "${key}"`);
  connection.write(RESPParser.toBulkString(DB.get(key)));
}