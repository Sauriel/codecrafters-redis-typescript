import { Socket } from "net";

import type { PayloadType } from "../commandParser";
import RESPParser from "../respParser";
import CONFIG from "../config";

export default function config(connection: Socket, payload: PayloadType) {
  const configType = payload[0] as string;
  const configKey = payload[1] as string;

  if (configType.toLowerCase() === "get" && configKey) {
    // @ts-ignore this should work
    const configValue = CONFIG[configKey];
    console.log(`Getting config for "${configKey}" => "${configValue}"`);
    connection.write(RESPParser.toArray([RESPParser.toBulkString(configKey), RESPParser.toBulkString(configValue)]));
  }
}