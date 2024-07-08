import fs from "fs";
import bencode from "bencode";

export const open = (filepath) =>
	bencode.decode(fs.readFileSync(filepath), "utf8");

export const size = (torrent) => {};

export const infoHash = (torrent) => {};
