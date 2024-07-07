import { parse } from "url";
import { Buffer } from "buffer";
import dgram from "dgram";

// steps to get the list of Peers from the torrent

// 1 . Send a connect request
// 2 . Get the connect response and extract the connection ID
// 3 . Use the connection id to send an announce request (this is where we tell the tracker which files we're interested in)
// 4 . Get the announce response and extract the peers list

export const getPeers = (torrent, callback) => {
	const socket = dgram.createSocket("udp4");
	const url = parse(torrent.announce);

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

const respType = (res) => console.log(res);

const buildAnnounceReq = () => {};

const parseAnnounceResp = () => {};
