import fs from "fs";
import bencode from "bencode";

const torrent = bencode.decode(fs.readFileSync("puppy.torrent"), "utf8");

console.log(torrent.announce);
