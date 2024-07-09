import fs from "fs";
import bencode from "bencode";
import { getPeers } from "./src/tnekt.js";
import { BigInteger } from "bignumber";
import { open } from "./src/torrent-parser.js";

const torrent = open("./zeb.torrent");

getPeers(torrent, (peers) => {
	console.log("List of peers: ", peers);
});
