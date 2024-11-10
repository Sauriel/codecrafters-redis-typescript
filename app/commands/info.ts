import { Socket } from "net";

import type { PayloadType } from "../commandParser";
import RESPParser from "../respParser";
import CONFIG from "../config";

export default function info(connection: Socket, payload: PayloadType) {
  const infoType = payload[0] as string;
  console.log(`Sending INFO for "${infoType}"`);
  if (infoType === "replication") {
    connection.write(RESPParser.toBulkString(`role:${CONFIG.master ? "slave" : "master"}`));
  }
}