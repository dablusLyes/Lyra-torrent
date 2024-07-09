import { parse } from "url";
import { Buffer } from "buffer";
import dgram, { Socket } from "dgram";
import crypto from "crypto";
import { genId } from "./utils.js";
import { open, size, infoHash } from "./torrent-parser.js";

// steps to get the list of Peers from the torrent

// 1 . Send a connect request
// 2 . Get the connect response and extract the connection ID
// 3 . Use the connection id to send an announce request (this is where we tell the tracker which files we're interested in)
// 4 . Get the announce response and extract the peers list

export const getPeers = (torrent, callback) => {
	const socket = dgram.createSocket("udp4");
	console.log(torrent);
	const url = parse(torrent.announce);

	udpSend(socket, buildConnReq(), url);
	// a . send connect req
	socket.on("message", (res) => {
		console.log("resp?");
		if (respType(res) === "connect") {
			console.log(res);
			// b . get the reponse id and build the announce msg
			const connResp = parseConnResp(res);
			// c . send the announce response
			const announceReq = buildAnnounceReq(connResp.connectionId);
			udpSend(socket, announceReq, url);
		} else if (respType(res) === "announce") {
			console.log(res);
			// d . Parse the announce response
			const announceResp = parseAnnounceResp(res);
			// e . Pass peers to callback
			callback(announceResp.peers);
		}
		console.log("yes?");
	});
};

const udpSend = (socket, message, rawUrl, callback = () => {}) => {
	const url = parse(rawUrl);
	socket.send(message, 0, message.length, url.port, url.host, callback);
};

const respType = (res) => {
	let action = res.readUint32BE(0);
	if (action === 0) return "connect";
	if (action === 1) return "announce";
};

/* 
	Connection request as decribed on the BEP (https://www.bittorrent.org/beps/bep_0015.html)  
    Offset  Size            Name            Value
    0       64-bit integer  connection_id   0x41727101980
    8       32-bit integer  action          0 // connect
    12      32-bit integer  transaction_id  ? // random 
    16 
*/

const buildConnReq = () => {
	// init a 16 bytes size buffer
	const buf = Buffer.alloc(16);

	/*      
		[0]	connection_id 
			write 0x41727101980 (idk why that number specifically ?XD) 
			in two parts because node.js doesn't suppport precise 64bit ints)
			so instead we split in two 32bit ints 
    */
	buf.writeUInt32BE(0x417, 0);
	buf.writeUInt32BE(0x27101980, 4);

	// [8] Action - should always be 0 for the connection request
	buf.writeUint16BE(0, 8);

	// [12] transaction_id ? random, crypto generates a random 4 byte message at offset 12 of the Buffer "buf"
	crypto.randomBytes(4).copy(buf, 12);

	console.log("connection request :", buf);

	return buf;
};
// Last resort let's try to get a torrent file that i am sure WORKS
// ah ya zebi explorer aw i3aniXDDDDDDDDDDDDDDDDDDDDDDD TNAKET
const parseConnResp = (res) => {
	let parsedResp = {
		action: res.readUInt32BE(0),
		transactionId: readUInt32BE(4),
		connectionId: res.slice(8),
	};

	console.log(parsedResp);
	return parsedResp;
};

/*
same logic as earlier, this time we will build a 98 byte buffer for the announce 


Offset  Size    Name    Value
0       64-bit integer  connection_id
8       32-bit integer  action          1 // announce
12      32-bit integer  transaction_id
16      20-byte string  info_hash
36      20-byte string  peer_id
56      64-bit integer  downloaded
64      64-bit integer  left
72      64-bit integer  uploaded
80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
84      32-bit integer  IP address      0 // default
88      32-bit integer  key             ? // random
92      32-bit integer  num_want        -1 // default
96      16-bit integer  port            ? // should be betwee
98 


the conn id we last generated is passed, with the torrent and a PORT
*/
const buildAnnounceReq = (connId, torrent, port = 6881) => {
	const buf = Buffer.allocUnsafe(98);

	// Connection id
	connId.copy(buf, 0);

	// action
	buf.writeUInt32BE(1, 8);

	// transaction id
	crypto.randomBytes(4).copy(buf, 12);

	// info hash
	infoHash(torrent).copy(buf, 16);

	// peer_id
	genId().copy(buf, 36);

	// downloaded
	Buffer.alloc(8).copy(buf, 56);

	// left (?XD)
	size(torrent).copy(buf, 64);

	// uploaded
	Buffer.alloc(8).copy(buf, 72);

	// event
	buf.writeInt32BE(0, 80);

	// ip address
	buf.writeUint32BE(0, 80);

	// key
	crypto.randomBytes(4).copy(buf, 88);

	// num want
	buf.writeInt32BE(-1, 92);

	// port
	buf.writeUInt16BE(port, 96);
	console.log("announce request :", buf);
	return buf;
};

/*
	Offset      Size            Name            Value
	0           32-bit integer  action          1 // announce
	4           32-bit integer  transaction_id
	8           32-bit integer  interval
	12          32-bit integer  leechers
	16          32-bit integer  seeders
	20 + 6 * n  32-bit integer  IP address
	24 + 6 * n  16-bit integer  TCP port
	
*/
const parseAnnounceResp = (resp) => {
	function group(iterable, groupSize) {
		let groups = [];
		for (let i = 0; i < iterable.length; i += groupSize) {
			groups.push(iterable.slice(i, i + groupSize));
		}
		return groups;
	}

	return {
		action: resp.readUInt32BE(0),
		transactionId: resp.readUInt32BE(4),
		leechers: resp.readUInt32BE(8),
		seeders: resp.readUInt32BE(12),
		peers: group(resp.slice(20), 6).map((address) => {
			return {
				ip: address.slice(0, 4).join("."),
				port: address.readUInt16BE(4),
			};
		}),
	};
};
