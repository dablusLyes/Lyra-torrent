import fs from "fs";
import bencode from "bencode";
import { getPeers } from "./src/tracker.js";
import { open, size, infoHash } from "./src/torrent-parser.js";

const torrent = open("puppy.torrent");

getPeers(torrent, (peers) => {
	console.log("List of peers: ", peers);
});
