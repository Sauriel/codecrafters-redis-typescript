import { Socket } from "net";

import echo from "./echo";
import get from "./get";
import ping from "./ping";
import set from "./set";
import type { Command } from "../commandParser";

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
  }
};