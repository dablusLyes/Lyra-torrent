import net from "net";
import { Buffer } from "buffer";
import { getPeers } from "./tracker.js";

// ugly import statements for now but i'll redesign shit as i go

export let passPeers = (torrent) => {
	getPeers(torrent, (peers) => {
		peers.forEach(download(torrent), console.log(peers));
	});
};

export function download(torrent) {
	const socket = net.Socket();
	socket.on("error", console.log);
	socket.connect(port, up, () => {
		socket.write(buffer.from(":D"));
	});

	socket.on("data", (responseBuffer) => {
		// use the respBuffer
	});
}
