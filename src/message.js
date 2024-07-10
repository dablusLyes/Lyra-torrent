import crypto from "crypto";
import { Buffer } from "buffer";
import { genId } from "./utils.js";
import { parse } from "url";
import { infoHash } from "./torrent-parser.js";

// handshake: <pstrlen><pstr><reserved><info_hash><peer_id>
const buildHandshake = (torrent) => {
	// allocate a buffer of size 49 + pstr.lenghth (in this case 19)
	const buf = Buffer.alloc(68);

	// 0 . pstr length
	buf.writeUInt8(19, 0);

	// 1 . pstr
	buf.write("BitTorrent protocol", 1);

	// 20 . reserved (2x 4 bytes)
	buf.writeInt32BE(0, 20);
	buf.writeInt32BE(0, 24);

	// 28 . infoHash
	infoHash(torrent).copy(buf, 28);

	// 48 . peerId
	buf.write(genId());

	return buf;
};

// keep-alive: <len=0000>
export const keepAlive = () => {
	return Buffer.alloc(4);
};

// choke: <len=0001><id=0>
export const buildchokse = () => {
	buf = Buffer.alloc(5);

	buf.writeUInt32BE(1, 0);
	buf.writeUInt8(0, 4);

	return buf;
};
// unchoke: <len=0001><id=1>
export const buildUnchoke = () => {
	buf = Buffer.alloc(5);

	buf.writeUInt32BE(1, 0);
	buf.writeUInt8(1, 4);

	return buf;
};

// interested: <len=0001><id=2>
export const buildInterested = () => {
	buf = Buffer.alloc(5);
	buf.writeUInt32BE(1, 0);
	buf.writeUInt8(2, 4);

	return buf;
};
//not interested: <len=0001><id=3>

export const buildNotInterested = () => {
	buf = Buffer.alloc(5);
	buf.writeUInt32BE(1, 0);
	buf.writeUInt8(3, 4);

	return buf;
};

// have: <len=0005><id=4><piece index>
export const buildHave = (payload) => {
	buf = Buffer.alloc();
	// length
	buf.writeUInt32BE(5, 0);

	// id
	buf.writeUInt8(4, 4);

	// piece index
	buf.writeUInt32BE(payload, 5);
	return buf;
};

// bitfield: <len=0001+X><id=5><bitfield>

export const buildBitfield = (bitfield) => {
	const buf = Buffer.alloc(14);

	// length
	buf.writeUInt32BE(payload.length + 1, 0);

	// id
	buf.writeUInt8(5, 4);

	// bitfield
	bitfield.copy(buf, 5);

	return buf;
};
// request: <len=0013><id=6><index><begin><length>

export const buildRequest = (payload) => {
	const buf = Buffer.alloc(17);

	buf.writeUInt32BE(13, 0);

	buf.writeUInt8(6, 4);
	buf.writeUInt32LE(payload.index, 5);
	buf.writeUInt32BE(payload.index, 9);
	buf.writeUInt32BE(payload.length, 13);
	return buf;
};

// piece: <len=0009+X><id=7><index><begin><block>
export const buildPiece = (payload) => {
	const buf = Buffer.alloc(payload.block.lenth + 13);

	// length
	buf.writeUInt32BE(payload.block.length + 9, 0);
	// id
	buf.writeUInt8(7, 4);
	// index
	buf.writeUInt32BE(payload.index, 5);
	// begin;
	buf.writeUInt32BE(payload.begin, 9);
	// block
	payload.block.copy(buf, 13);
	return buf;
};

export const buildCancel = (payload) => {
	const buf = Buffer.alloc(17);
	// length
	buf.writeUInt32BE(13, 0);
	// id
	buf.writeUInt8(8, 4);
	// piece index
	buf.writeUInt32BE(payload.index, 5);
	// begin
	buf.writeUInt32BE(payload.begin, 9);
	// length
	buf.writeUInt32BE(payload.length, 13);
	return buf;
};

export const buildPort = (payload) => {
	const buf = Buffer.alloc(7);
	// length
	buf.writeUInt32BE(3, 0);
	// id
	buf.writeUInt8(9, 4);
	// listen-port
	buf.writeUInt16BE(payload, 5);
	return buf;
};
console.log("ZEBIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII");
// WHEN THE RTFM SESSION CONTAINS WER9A W STYLO....
