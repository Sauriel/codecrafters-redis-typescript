export type RESPDataType = string | number | null | RESPDataType[];

export default class RESPParser {
  public parse(buffer: Buffer): RESPDataType {
    const input = buffer.toString();
    // console.log([input]);
    if (!input) {
      throw new Error("Input cannot be empty");
    }
    const lines = input.split(/\r\n/);
    return this.parseLines(lines);
  }

  private parseLines(lines: string[]): RESPDataType {
    // console.log(lines);
    const type = lines.shift();
    if (!type) {
      throw new Error("Invalid RESP input");
    }

    switch (type[0]) {
      case "+": // Simple String
        return type.slice(1);
      case "-": // Error
        throw new Error(type.slice(1));
      case ":": // Integer
        return parseInt(type.slice(1), 10);
      case "$": // Bulk String
        return this.parseBulkString(type, lines);
      case "*": // Array
        return this.parseArray(type, lines);
      default:
        throw new Error(`Unknown RESP type: ${type[0]}`);
    }
  }

  private parseBulkString(type: string, lines: string[]): string | null {
    const length = parseInt(type.slice(1), 10);
    if (length === -1) {
      return null; // Null bulk string
    }

    const value = lines.shift();
    if (value === undefined || value.length !== length) {
      throw new Error("Bulk string length mismatch");
    }

    return value;
  }

  private parseArray(type: string, lines: string[]): RESPDataType {
    const length = parseInt(type.slice(1), 10);
    if (length === -1) {
      return null; // Null array
    }

    const array: RESPDataType = [];
    for (let i = 0; i < length; i++) {
      array.push(this.parseLines(lines));
    }

    return array;
  }

  public toBulkString(value: string | undefined): string {
    if (value) {
      return `$${value.length}\r\n${value}\r\n`;
    } else {
      return "$-1\r\n";
    }
  }

  public toSimpleString(value: string): string {
    return `+${value}\r\n`;
  }

  public toSimpleError(message: string): string {
    return `-${message}\r\n`;
  }

  public toInteger(value: number): string {
    return `:${value}\r\n`;
  }
}
