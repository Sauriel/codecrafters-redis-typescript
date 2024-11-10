import { Socket } from "net";

import type { PayloadType } from "../commandParser";
import RESPParser from "../respParser";

export default function echo(connection: Socket, payload: PayloadType) {
  const message = payload[0] as string;
  console.log(`Echoing "${message}"`);
  connection.write(RESPParser.toBulkString(message));
}