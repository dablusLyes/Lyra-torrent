import { parse } from "url";
import { Buffer } from "buffer";
import dgram from "dgram";
import { crypto } from crypto
// steps to get the list of Peers from the torrent

// 1 . Send a connect request
// 2 . Get the connect response and extract the connection ID
// 3 . Use the connection id to send an announce request (this is where we tell the tracker which files we're interested in)
// 4 . Get the announce response and extract the peers list

export const getPeers = (torrent, callback) => {
	const socket = dgram.createSocket("udp4");
	const url = parse(torrent.announce);
	console.log(url);
	udpSend(socket, buildConnReq(), url);

	// a . send connect req
	socket.on("message", (res) => {
		if (respType(res) === "connect") {
			// b . get the reponse id and build the announce msg
			const connResp = parseConnResp(res);
			// c . send the announce response
			const announceReq = buildAnnounceReq(connResp.connectionId);
			udpSend(socket, announceReq, url);
		} else if (respType(reponse) === "announce") {
			// d . Parse the announce response
			const announceResp = parseAnnounceResp(reponse);
			// e . Pass peers to callback
			callback(announceResp.peers);
		}
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

const buildAnnounceReq = () => {};

const parseAnnounceResp = () => {};



/* Connection request as decribed on the BEP (https://www.bittorrent.org/beps/bep_0015.html)  

    Offset  Size            Name            Value
    0       64-bit integer  connection_id   0x41727101980
    8       32-bit integer  action          0 // connect
    12      32-bit integer  transaction_id  ? // random
    16 
*/
const buildConnReq = () => {
    // init a 16 bytes size buffer
    const buf = Buffer.alloc(16);

    /* [0]    connection_id 
              written 0x41727101980 (idk why that number specifically ?XD) & 
              in two parts because node doesn't suppport precise 64bit ints)
              so instead we split in two 32bit ints 
    
    */
    buf.writeUInt32BE(0x417, 0);
    // [3]
    buf.writeUInt32BE(0x27101980, 4);

    // [8] Action - should always be 0 for the connection request
    buf.writeUint16BE(0, 8)
    
    // [12] transaction_id ? random, crypto generates a random 4 byte message at offset 12 of the Buffer "buf" 
    crypto.randomBytes(4).copy(buf, 12)
    
    return buf;
};

const parseConnResp = (res) => {
    return {
        action: res.readUint32BE(0),
        transactionId: readUint32BE(4),
        connectionId : res.slice(8)
    }
}
