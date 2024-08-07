import crypto from "crypto";

let id = null;

export const genId = () => {
	if (!id) {
		id = crypto.randomBytes(20);
		Buffer.from("-LR0001-").copy(id, 0);
	}
	return id;
};

export let BigIntToBuffer = function (bigint, opts) {
	if (typeof opts === "string") {
		if (opts !== "mpint") return "Unsupported Buffer representation";

		var abs = bigint.abs();
		var buf = abs.toBuffer({ size: 1, endian: "big" });
		var len = buf.length === 1 && buf[0] === 0 ? 0 : buf.length;
		if (buf[0] & 0x80) len++;

		var ret = Buffer.alloc(4 + len);
		if (len > 0) buf.copy(ret, 4 + (buf[0] & 0x80 ? 1 : 0));
		if (buf[0] & 0x80) ret[4] = 0;

		ret[0] = len & (0xff << 24);
		ret[1] = len & (0xff << 16);
		ret[2] = len & (0xff << 8);
		ret[3] = len & (0xff << 0);

		// two's compliment for negative integers:
		var isNeg = bigint.lt(0);
		if (isNeg) {
			for (var i = 4; i < ret.length; i++) {
				ret[i] = 0xff - ret[i];
			}
		}
		ret[4] = (ret[4] & 0x7f) | (isNeg ? 0x80 : 0);
		if (isNeg) ret[ret.length - 1]++;

		return ret;
	}

	if (!opts) opts = {};

	var endian =
		{ 1: "big", "-1": "little" }[opts.endian] || opts.endian || "big";

	var hex = bigint.toString(16);
	if (hex.charAt(0) === "-") {
		throw new Error(
			"converting negative numbers to Buffers not supported yet",
		);
	}

	var size =
		opts.size === "auto" ? Math.ceil(hex.length / 2) : opts.size || 1;

	len = Math.ceil(hex.length / (2 * size)) * size;
	buf = Buffer.alloc(len);

	// zero-pad the hex string so the chunks are all `size` long
	while (hex.length < 2 * len) hex = "0" + hex;

	var hx = hex
		.split(new RegExp("(.{" + 2 * size + "})"))
		.filter(function (s) {
			return s.length > 0;
		});

	hx.forEach(function (chunk, i) {
		for (var j = 0; j < size; j++) {
			var ix = i * size + (endian === "big" ? j : size - j - 1);
			buf[ix] = parseInt(chunk.slice(j * 2, j * 2 + 2), 16);
		}
	});

	return buf;
};
