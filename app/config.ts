type Config = {
  dir: string | null,
  dbfilename: string | null,
  master?: string;
}

const CONFIG: Config = {
  dir: null,
  dbfilename: null,
}

export default CONFIG;