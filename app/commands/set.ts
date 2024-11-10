import { Socket } from "net";

import type { PayloadType } from "../commandParser";
import RESPParser from "../respParser";
import DB from "../database";

export default function set(connection: Socket, payload: PayloadType) {
  const key = payload[0] as string;
  const value = payload[1] as string;
  const px = payload[2];
  const expireString = payload[3];
  if (px && (px as string).toLowerCase() === "px" && expireString) {
    const expire = parseInt(expireString as string);
    setTimeout(() => {
      DB.delete(key);
    }, expire);
    console.log(`setting "${key}" to "${value}" and deleting it in ${expire}ms`);
  } else {
    console.log(`setting "${key}" to "${value}"`);
  }
  DB.set(key, value);
  connection.write(RESPParser.toSimpleString("OK"));
}