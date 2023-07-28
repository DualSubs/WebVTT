// refer: https://www.w3.org/TR/webvtt1/
function WebVTT(opts) {
	return new (class {
		constructor(opts = ["milliseconds", "timeStamp", "singleLine", "\n"]) {
			this.name = "WebVTT v2.0.0";
			this.opts = opts;
			this.newLine = (this.opts.includes("\n")) ? "\n" : (this.opts.includes("\r")) ? "\r" : (this.opts.includes("\r\n")) ? "\r\n" : "\n";
			this.vtt = new String;
			this.txt = new String;
			this.json = { headers: {}, note: [], css: "", body: [] };
		};

		parse(vtt = this.vtt) {
			const body_CUE_Regex = (this.opts.includes("milliseconds")) ? /^((?<srtNum>\d+)(\r\n|\r|\n))?(?<timeLine>(?<startTime>[0-9:.,]+) --> (?<endTime>[0-9:.,]+)) ?(?<options>.+)?[^](?<text>[\s\S]*)?$/
				: /^((?<srtNum>\d+)(\r\n|\r|\n))?(?<timeLine>(?<startTime>[0-9:]+)[0-9.,]+ --> (?<endTime>[0-9:]+)[0-9.,]+) ?(?<options>.+)?[^](?<text>[\s\S]*)?$/
			const Array = vtt.split(/\r\n\r\n|\r\r|\n\n/);
			const Json = {
				headers: {},
				note: [],
				style: "",
				body: []
			};

			Array.forEach((item, i) => {
				item = item.trim();
				switch (item.substring(0, 5).trim()) {
					case "WEBVT": {
						let array = item.split(/\r\n|\r|\n/);
						$.log(`🚧 ${$.name}`, `array: ${array}`);
						Json.headers.type = array.shift();
						Json.headers.options = array;
						break;
					};
					case "NOTE": {
						let array = item.split(/\r\n|\r|\n/);
						$.log(`🚧 ${$.name}`, `array: ${array}`);
						Json.note = array;
						break;
					};
					case "STYLE": {
						Json.style = item;
						break;
					};
					default:
						Json.body[i] = item.match(body_CUE_Regex)?.groups ?? undefined;
						break;
				}
			});
			Json.body = Json.body.filter(Boolean);
			Json.body = Json.body.map((item, i) => {
				item.index = i;
				if (Json.headers?.type !== "WEBVTT") {
					item.timeLine = item.timeLine.replace(",", ".");
					item.startTime = item.startTime.replace(",", ".");
					item.endTime = item.endTime.replace(",", ".");
				}
				if (this.opts.includes("timeStamp")) {
					let ISOString = item.startTime.replace(/(.*)/, "1970-01-01T$1Z")
					item.timeStamp = this.opts.includes("milliseconds") ? Date.parse(ISOString) : Date.parse(ISOString) / 1000;
				}
				item.text = item.text?.trim() ?? "_";
				if (this.opts.includes("singleLine")) {
					item.text = item.text.replace(/\r\n|\r|\n/, " ");
				} else if (this.opts.includes("multiLine")) {
					item.text = item.text.split(/\r\n|\r|\n/);
				}
				return item
			});
			return Json
		};

		stringify(json = this.json) {
			let vtt = [
				json.headers = [json.headers?.type || "", json.headers?.options || ""].flat(Infinity).join(this.newLine),
				json.note = (json.note ?? "").join(this.newLine),
				json.style = json.style ?? "",
				json.body = json.body.map(item => {
					if (Array.isArray(item.text)) item.text = item.text.join(this.newLine);
					item = `${(item.srtNum) ? item.srtNum + this.newLine : ""}${item.timeLine} ${item?.options ?? ""}${this.newLine}${item.text}`;
					return item;
				}).join(this.newLine + this.newLine)
			].join(this.newLine + this.newLine).trim();
			return vtt
		};
	})(opts)
}
