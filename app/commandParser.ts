import type { RESPDataType } from "./respParser";

export type PayloadType = Exclude<RESPDataType, RESPDataType[]>[];

export type CommandType = "echo" | "ping" | "set" | "get" | "config" | "keys";

export type Command = {
  type: CommandType;
  payload: PayloadType;
};

export default class CommandParser {
  public static parseRESP(resp: RESPDataType): Command {
    if (!Array.isArray(resp)) {
      throw new Error("Is no array");
    }

    const commandType: CommandType = (
      resp.shift() as string
    ).toLowerCase() as CommandType;
    const command = resp;
    return {
      type: commandType,
      payload: command as PayloadType,
    };
  }
}
