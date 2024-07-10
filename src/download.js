import net from "net";
import { Buffer } from "buffer";
import { getPeers } from "./tracker.js";

export let passPeers = (torrent) => {
	getPeers(torrent, (peers) => {
		peers.forEach(download);
	});
};

export function download(peer) {
	const socket = net.Socket();
	socket.on("error", console.log);

	socket.connect(peer.port, peer.ip, () => {
		socket.write(buffer.from("Oui le Q"));
	});

	socket.on("data", (responseBuffer) => {
		// use the respBuffer
	});
}
