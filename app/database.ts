import { createIfNotExist, loadDBs } from "./fileUtils";

const DB = new Map<string, string>();

export default DB;

function openDatabase(dir: string, filename: string) {
  createIfNotExist(dir, filename);
  loadDBs(dir, filename)
    .flat()
    .forEach(entry => {
      DB.set(entry.key, entry.value);
    });
}

export {
  openDatabase
}