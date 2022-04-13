// refer: https://www.w3.org/TR/webvtt1/
function WebVTT(opts) {
	return new (class {
		constructor(opts = ["milliseconds", "timeStamp", "singleLine", "\n"]) {
			this.name = "WebVTT v1.7.0";
			this.opts = opts;
			this.newLine = (this.opts.includes("\n")) ? "\n" : (this.opts.includes("\r")) ? "\r" : (this.opts.includes("\r\n")) ? "\r\n" : "\n";
			this.vtt = new String;
			this.txt = new String;
			this.json = { headers: {}, CSS: {}, body: [] };
		};

		parse(vtt = this.vtt) {
			const headers_WEBVTT_Regex = /^(?<fileType>WEBVTT)?[^](?<Xoptions>.+[^])*/;
			const headers_STYLE_Regex = /^(?<Style>STYLE)[^](?<Boxes>.*::cue.*(\(.*\))?((\n|.)*}$)?)/m;
			const body_CUE_Regex = (this.opts.includes("milliseconds")) ? /^((?<srtNum>\d+)(\r\n|\r|\n))?(?<timeLine>(?<startTime>[0-9:.,]+) --> (?<endTime>[0-9:.,]+)) ?(?<options>.+)?[^](?<text>[\s\S]*)$/
				: /^((?<srtNum>\d+)(\r\n|\r|\n))?(?<timeLine>(?<startTime>[0-9:]+)[0-9.,]+ --> (?<endTime>[0-9:]+)[0-9.,]+) ?(?<options>.+)?[^](?<text>[\s\S]*)$/
			let json = {
				headers: vtt.match(headers_WEBVTT_Regex)?.groups ?? null,
				CSS: vtt.match(headers_STYLE_Regex)?.groups ?? null,
				body: vtt.split(/\r\n\r\n|\r\r|\n\n/).map(item => item = item.match(body_CUE_Regex)?.groups ?? "")
			};

			json.body = json.body.filter(Boolean);
			json.body = json.body.map((item, i) => {
				item.index = i;
				if (json.headers?.fileType !== "WEBVTT") {
					item.timeLine = item.timeLine.replace(",", ".");
					item.startTime = item.startTime.replace(",", ".");
					item.endTime = item.endTime.replace(",", ".");
				}
				if (this.opts.includes("timeStamp")) {
					let ISOString = item.startTime.replace(/(.*)/, "1970-01-01T$1Z")
					item.timeStamp = this.opts.includes("milliseconds") ? Date.parse(ISOString) : Date.parse(ISOString) / 1000;
				}
				item.text = item.text.trim();
				if (this.opts.includes("singleLine")) {
					item.text = item.text.replace(/\r\n|\r|\n/, " ");
				} else if (this.opts.includes("multiLine")) {
					item.text = item.text.split(/\r\n|\r|\n/);
				}
				return item
			});
			return json
		};

		stringify(json = this.json) {
			let vtt = [
				json.headers = [json.headers?.fileType || "WEBVTT", json.headers?.Xoptions || null].join(this.newLine),
				json.CSS = json.CSS?.Style ? [json.CSS.Style, json.CSS.Boxes].join(this.newLine) : null,
				json.body = json.body.map(item => {
					if (Array.isArray(item.text)) item.text = item.text.join(this.newLine);
					item = `${item.timeLine} ${item?.options ?? ""}${this.newLine}${item.text}`;
					return item;
				}).join(this.newLine + this.newLine)
			].join(this.newLine + this.newLine);
			return vtt
		};
	})(opts)
}
