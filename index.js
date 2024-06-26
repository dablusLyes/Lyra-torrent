import fs from "fs";
import bencode from "bencode";
import { Server } from "socketio";
import { parse } from "url";

const torrent = bencode.decode(fs.readFileSync("puppy.torrent"), "utf8");

url = parse(torrent.announce);

const socket = dgram.createSocket("udp4");

console.log(torrent.announce);
