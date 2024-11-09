import type { RESPDataType } from "./respParser";

export type CommandType = "echo" | "ping";

export type Command = {
  type: CommandType;
  payload: RESPDataType;
};

export default class CommandParser {
  public parseRESP(resp: RESPDataType): Command {
    if (!Array.isArray(resp)) {
      throw new Error("Is no array");
    }

    const commandType: CommandType = (
      resp[0] as string
    ).toLowerCase() as CommandType;
    const command = resp[1];
    return {
      type: commandType,
      payload: command,
    };
  }
}
