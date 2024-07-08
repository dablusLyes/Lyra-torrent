import fs from "fs";
import bencode from "bencode";
import express from "express";
import { getPeers } from "./tracker.js";
import { parse } from "url";
import { Buffer } from "buffer";
import dgram from "dgram";
import { log } from "console";
let buffer = Buffer;

const torrent = bencode.decode(fs.readFileSync("puppy.torrent"), "utf8");
let url = parse(torrent.announce);

const socket = dgram.createSocket("udp4");

const myMsg = Buffer.from("hello?", "utf-8");

// socket.send(myMsg, 0, myMsg.length, url.port, url.host, () => {});

// socket.on("message", (msg) => {
// 	console.log("messge : ", msg);
// });

getPeers(torrent, console.log());
