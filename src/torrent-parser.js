import fs from "fs";
import bencode from "bencode";
import * as crypto from "crypto";
import { BigIntToBuffer } from "./utils.js";

export const open = (filepath) =>
	bencode.decode(fs.readFileSync("dz.torrent"), "utf-8");

export const size = (torrent) => {
	const size = torrent.info.files
		? torrent.info.files.map((file) => file.length).reduce((a, b) => a + b)
		: torrent.info.length;
	let a = BigInt(size);
	return BigIntToBuffer(a, { size: 8 });
};

export const infoHash = (torrent) => {
	const info = bencode.encode(torrent.info);
	return crypto.createHash("sha1").update(info).digest();
};
