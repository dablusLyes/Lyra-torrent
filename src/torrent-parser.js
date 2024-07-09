import fs from "fs";
import bencode from "bencode";
import * as crypto from "crypto";
import { toBigIntBE } from "bigint-buffer";

export const open = (filepath) =>
	bencode.decode(fs.readFileSync("dz.torrent"), "utf-8");

export const size = (torrent) => {
	let size = null;
	if (torrent.info.files) {
		size = torrent.info.files
			.map((files) => files.length)
			.reduce((a, b) => a + b);
	} else {
		size = torrent.info.length;
	}
	let a = BigInt(size);
	return toBigIntBE(a, 8);
};

export const infoHash = (torrent) => {
	const info = bencode.encode(torrent.info);
	return crypto.createHash("sha1").update(info).digest();
};
