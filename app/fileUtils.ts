import { createWriteStream, existsSync, readFileSync } from "fs";
import { join } from "path";

type DbEntry = {
  key: string,
  value: string,
  expireInt?: number,
  expireLong?: bigint;
}

const ENCODING: BufferEncoding = 'ascii';

function encodeStringWithLength(value: string): Buffer {
  const lengthBuffer = Buffer.from([value.length]); // Single-byte length (assuming the length fits in one byte)
  const valueBuffer = Buffer.from(value, ENCODING);
  // @ts-ignore Buffer is a Uint8Array
  return Buffer.concat([lengthBuffer, valueBuffer]);
}

function writeContent(marker: number[], content: Record<string, string>): Buffer {
  const metadatas: Buffer[] = [];
  metadatas.push(Buffer.from(marker));
  Object.entries(content).forEach(([key, value]) => {
    metadatas.push(encodeStringWithLength(key));
    metadatas.push(encodeStringWithLength(value));
  });
  // @ts-ignore Buffer is a Uint8Array
  return Buffer.concat(metadatas);
}

function writeHeader(): Buffer {
  const magic = "REDIS";
  const version = "0011";
  return Buffer.from(magic + version, ENCODING);
}

function writeFooter(checksum = 0n): Buffer {
  const footer = Buffer.alloc(8);
  footer.writeBigUInt64LE(checksum);
  // @ts-ignore Buffer is a Uint8Array
  return Buffer.concat([0xFF, footer]);
}

function writeMetadata(metadata: Record<string, string>): Buffer {
  return writeContent([0xFA], metadata);
}

function createRDBFile(path: string) {
  const header = writeHeader();
  // const footer = writeFooter();

  const fileStream = createWriteStream(path);
  fileStream.write(header);
  // fileStream.write(footer);
  fileStream.end();
}

function createIfNotExist(dir: string, filename: string) {
  const path = join(dir, filename);

  if (!existsSync(path)) {
    console.log(`File "${path}" not found. creating it now ...`)
    createRDBFile(path);
    console.log(`File "${path}" created.`)
  } else {
    console.log(`File "${path}" already exists.`)
  }
}

function readMetadataSection(data: Buffer, offset: number): { metadata: Map<string, string>, newOffset: number } {
  const metadata = new Map<string, string>();
  
  // Reading metadata subsections
  while (data[offset] === 0xFA) {
    offset++; // Skip the start byte (0xFA)

    // Read metadata attribute name
    const nameLength = data[offset];
    offset++;
    const name = data.slice(offset, offset + nameLength).toString(ENCODING);
    offset += nameLength;

    // Read metadata attribute value
    let valueLength = data[offset];
    offset++;
    const valueArray = data.slice(offset, offset + valueLength);
    const startOfDb = valueArray.indexOf(0xFE);
    if (startOfDb > 0) {
      valueLength = startOfDb;
    }
    
    const value = data.slice(offset, offset + valueLength).toString(ENCODING);
    offset += valueLength;

    console.log(`Metadata - ${name}: ${value}`);
    metadata.set(name, value);
  }

  return { metadata, newOffset: offset };
}

function readKeyValue(data: Buffer, offset: number): { entry: DbEntry, newOffset: number } {
  const valueType = data[offset];
  offset++;
  const keyLength = data[offset];
  offset++;
  const key = data.slice(offset, offset + keyLength).toString(ENCODING);
  offset += keyLength;
  let value = "UNKNOWN";
  if (valueType === 0x00) {
    // string
    const valueLength = data[offset];
    offset++;
    value = data.slice(offset, offset + valueLength).toString(ENCODING);
    offset += valueLength;
  }
  const entry: DbEntry = {
    key,
    value,
  };
  return { entry, newOffset: offset };
}

function readDatabaseSections(data: Buffer, offset: number): { databases: DbEntry[][], newOffset: number } {
  const databases: DbEntry[][] = [];
  while (data[offset] === 0xFE) {
    const dbEntries: DbEntry[] = [];
    offset++; // Skip the start byte (0xFE)
    const dbIndex = data[offset];
    offset++;  // Skip the db index (0x00.. 0xFF)
    let hashTableSize = 0;
    let hashTablesWithExpire = 0;
    if (data[offset] === 0xFB) {
      // has hash table size information
      offset++;
      hashTableSize = data[offset];
      offset++;
      hashTablesWithExpire = data[offset];
      offset++;
    }
    while (data[offset] !== 0xFE && data[offset] !== 0xFF) {
      let entry: DbEntry;
      switch(data[offset]) {
        case 0xFC:
          // expire in ms
          offset++;
          const msExpire = data.slice(offset, offset + 8).toString(ENCODING);
          offset += 8;
          const msResult = readKeyValue(data, offset);
          entry = msResult.entry;
          entry.expireLong = BigInt(msExpire);
          offset = msResult.newOffset;
          break;
        case 0xFD:
          // expire in s
          offset++;
          const sExpire = data.slice(offset, offset + 4).toString(ENCODING);
          offset += 4;
          const sResult = readKeyValue(data, offset);
          entry = sResult.entry;
          entry.expireInt = Number.parseInt(sExpire);
          offset = sResult.newOffset;
          break;
        default:
          // no expire
          const simpleResult = readKeyValue(data, offset);
          entry = simpleResult.entry;
          offset = simpleResult.newOffset;
          break;
      }
      dbEntries.push(entry);
    }

    databases.push(dbEntries);
  }
  return {
    databases,
    newOffset: offset,
  }
}

function find(entries: DbEntry[], query: string): string [] {
  if (query === "*") {
    return entries.map(e => e.key);
  } else {
    return entries.filter(e => e.key === query).map(e => e.key);
  }
}

function read(dir: string, filename: string, query: string): string[] {
  const path = join(dir, filename);
  const data = readFileSync(path);
  let offset = 0;

  // Read and parse the header (first 9 bytes)
  const header = data.slice(0, 9).toString(ENCODING);
  offset+= 9;

  console.log(`Header: ${header}`);
  if (!header.startsWith('REDIS')) {
    throw new Error('Invalid RDB file header');
  }

  const version = Number.parseInt(header.slice(5));
  console.log(`RDB Version: ${version}`);

  const metadataResult = readMetadataSection(data, offset);
  offset = metadataResult.newOffset;
  const databaseResult = readDatabaseSections(data, offset);
  offset  = databaseResult.newOffset;

  return find(databaseResult.databases.flat(), query);
}

export {
  createIfNotExist,
  read
}