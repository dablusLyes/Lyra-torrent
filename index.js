import fs from "fs";
import bencode from "bencode";
import { getPeers } from "./src/tracker.js";
import { open } from "./src/torrent-parser.js";
import { download, passPeers } from "./src/download.js";

const torrent = open("dz.torrent");

passPeers(torrent);
// download(torrent);

// getPeers(torrent, (peers) => {
// 	console.log("List of peers: ", peers);
// });

// REFACTORADO !
