// refer: https://www.w3.org/TR/webvtt1/
function WebVTT(name, opts) {
	return new (class {
		constructor(name, opts) {
			this.name = name
			Object.assign(this, opts)
		};

		parse(vtt = new String, options = ["timeStamp"]) {
			const headers_WEBVTT_Regex = /^(?<fileType>WEBVTT)?[^](?<Xoptions>.+[^])*/;
			const headers_STYLE_Regex = /^(?<Style>STYLE)[^](?<Boxes>.*::cue.*(\(.*\))?((\n|.)*}$)?)/m;
			const webVTT_body_Regex = (options.includes("ms")) ? /^(?:(?<srtNum>\d+)[(\r\n)\r\n])?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d) --> (?<endTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d)) ?(?<options>.+)?[^](?<text>.+)/
				: /^(?:(?<srtNum>\d+)[(\r\n)\r\n])?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d --> (?<endTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d) ?(?<options>.+)?[^](?<text>.+)/
			let json = {
				headers: vtt.match(headers_WEBVTT_Regex)?.groups ?? null,
				CSS: vtt.match(headers_STYLE_Regex)?.groups ?? null,
				body: vtt.split(/[(\r\n)\r\n]{2,}/).map(item => item = item.match(webVTT_body_Regex)?.groups ?? "")
			};
			json.body = json.body.filter(Boolean);
			json.body = json.body.map((item, i) => {
				item.index = i;
				if (json.headers?.fileType !== "WEBVTT") {
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

		stringify(json = { headers: {}, CSS: {}, body: [] }, options = ["milliseconds", "\n"]) {
			const newLine = (options.includes("\n")) ? "\n" : (options.includes("\r")) ? "\r" : (options.includes("\r\n")) ? "\r\n" : "\n";
			let vtt = [
				json.headers = json.headers?.Xoptions ? [json.headers?.fileType ?? "WEBVTT", json.headers?.Xoptions ?? null].join(newLine) : json.headers?.fileType ?? "WEBVTT",
				json.CSS = json.CSS?.Style ? [json.CSS.Style, json.CSS.Boxes].join(newLine) : null,
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
