import { createIfNotExist, loadDBs } from "./fileUtils";

const DB = new Map<string, string>();

export default DB;

function openDatabase(dir: string, filename: string) {
  createIfNotExist(dir, filename);
  loadDBs(dir, filename)
    .flat()
    .forEach(entry => {
      let isExpired = false;
      if (entry.expireLong) {
        isExpired = entry.expireLong < Date.now();
      } else if (entry.expireInt) {
        isExpired = (entry.expireInt * 1000) < Date.now();
      }

      if (!isExpired) {
        DB.set(entry.key, entry.value);
      }
    });
}

export {
  openDatabase
}