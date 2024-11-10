import CONFIG from "./config";
import { createIfNotExist } from "./fileUtils";

const DB = new Map<string, string>();

export default DB;

function openDatabase(dir: string, filename: string) {
  createIfNotExist(dir, filename);
}

export {
  openDatabase
}