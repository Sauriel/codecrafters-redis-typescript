import { Socket } from "net";

import type { Command } from "../commandParser";
import echo from "./echo";
import get from "./get";
import ping from "./ping";
import set from "./set";
import config from "./config";
import keys from "./keys";
import info from "./info";

export default function execute(connection: Socket, command: Command) {
  switch (command.type) {
    case "ping":
      ping(connection);
      break;
    case "echo":
      echo(connection, command.payload);
      break;
    case "set":
      set(connection, command.payload);
      break;
    case "get":
      get(connection, command.payload);
      break;
    case "config":
      config(connection, command.payload);
      break;
    case "keys":
      keys(connection, command.payload);
      break;
    case "info":
      info(connection, command.payload);
      break;
  }
};