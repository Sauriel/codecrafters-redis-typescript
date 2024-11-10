import { Socket } from "net";

import RESPParser from "../respParser";

export default function ping(connection: Socket) {
  console.log("Sending PONG...");
  connection.write(RESPParser.toSimpleString("PONG"));
}