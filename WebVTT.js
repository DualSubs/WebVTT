function WebVTT(name, opts) {
	return new (class {
		constructor(name, opts) {
			this.name = name
			Object.assign(this, opts)
		};

		parse(vtt = new String, options = ["timeStamp"]) {
			let array = vtt.split(/[(\r\n)\r\n]{2,}/);
			let json = {
				headers: (array[0] == "WEBVTT") ? array.slice(0, 3) : null,
				body: (array[0] == "WEBVTT") ? array.slice(3) : array
			};
			const webVTT_Regex = (options.includes("ms")) ? /^(?<srtNum>\d+)?[(\r\n)\r\n]?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d) --> (?<endTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d)) ?(?<options>.+)?[(\r\n)\r\n](?<text>(?:.+)[(\r\n)\r\n]?(?:.+)?)/
				: /^(?<srtNum>\d+)?[(\r\n)\r\n]?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d --> (?<endTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d) ?(?<options>.+)?[(\r\n)\r\n](?<text>(?:.+)[(\r\n)\r\n]?(?:.+)?)/
			json.body = json.body.map(item => item = item.match(webVTT_Regex)?.groups ?? "");
			json.body = json.body.filter(Boolean);
			json.body = json.body.map((item, i) => {
				item.index = i;
				if (json.headers?.[0] !== "WEBVTT") {
					item.timeLine = item.timeLine.replace(",", ".");
					item.startTime = item.startTime.replace(",", ".");
					item.endTime = item.endTime.replace(",", ".");
				}
				if (options.includes("timeStamp")) {
					let ISOString = item.startTime.replace(/(.*)/, "1970-01-01T$1Z")
					item.timeStamp = options.includes("ms") ? Date.parse(ISOString) : Date.parse(ISOString) / 1000;
				}
				if (options.includes("multiText")) {
					item.text = item.text.split(/[(\r\n)\r\n]/);
				}
				return item
			});
			return json
		};

		stringify(json = { headers: new Array, body: new Array }, options = ["milliseconds", "\n"]) {
			const newLine = (options.includes("\n")) ? "\n" : (options.includes("\r")) ? "\r" : (options.includes("\r\n")) ? "\r\n" : "\n";
			let vtt = [
				json.headers = (json.headers?.[0] == "WEBVTT") ? json.headers.join(newLine + newLine) : "WEBVTT",
				json.body = json.body.map(item => {
					if (Array.isArray(item.text)) item.text = item.text.join(newLine);
					item = `${item.timeLine} ${item.options}${newLine}${item.text}`;
					return item;
				}).join(newLine + newLine)
			].join(newLine + newLine);
			return vtt
		};
	})(name, opts)
}
