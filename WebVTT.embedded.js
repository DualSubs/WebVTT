// refer: https://www.w3.org/TR/webvtt1/
// refer: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
function WebVTT(opts) {
	return new (class {
		constructor(opts = ["milliseconds", "timeStamp", "singleLine", "\n"]) {
			this.name = "WebVTT v2.1.3";
			this.opts = opts;
			this.lineBreak = (this.opts.includes("\n")) ? "\n" : (this.opts.includes("\r")) ? "\r" : (this.opts.includes("\r\n")) ? "\r\n" : "\n";
			this.vtt = new String;
			this.json = { headers: {}, comments: [], style: "", body: [] };
		};

		parse(vtt = this.vtt) {
			const WebVTT_cue_Regex = (this.opts.includes("milliseconds")) ? /^((?<index>\d+)[^])?(?<timing>(?<startTime>[0-9:.,]+) --> (?<endTime>[0-9:.,]+)) ?(?<settings>.+)?[^](?<text>[\s\S]*)?$/
				: /^((?<index>\d+)[^])?(?<timing>(?<startTime>[0-9:]+)[0-9.,]+ --> (?<endTime>[0-9:]+)[0-9.,]+) ?(?<settings>.+)?[^](?<text>[\s\S]*)?$/
			const Array = vtt.split(/\r\n\r\n|\r\r|\n\n/);
			const Json = { headers: {}, comments: [], style: "", body: [] };

			Array.forEach(item => {
				item = item.trim();
				switch (item.substring(0, 5).trim()) {
					case "WEBVT": {
						let cues = item.split(/\r\n|\r|\n/);
						Json.headers.type = cues.shift();
						Json.headers.options = cues;
						break;
					};
					case "NOTE": {
						Json.comments.push(item);
						break;
					};
					case "STYLE": {
						let cues = item.split(/\r\n|\r|\n/);
						cues.shift();
						Json.style = cues.join(this.lineBreak);
						break;
					};
					default:
						let cue = item.match(WebVTT_cue_Regex)?.groups;
						if (cue) {
							if (Json.headers?.type !== "WEBVTT") {
								cue.timing = cue?.timing?.replace?.(",", ".");
								cue.startTime = cue?.startTime?.replace?.(",", ".");
								cue.endTime = cue?.endTime?.replace?.(",", ".");
							}
							if (this.opts.includes("timeStamp")) {
								let ISOString = cue?.startTime?.replace?.(/(.*)/, "1970-01-01T$1Z")
								cue.timeStamp = this.opts.includes("milliseconds") ? Date.parse(ISOString) : Date.parse(ISOString) / 1000;
							}
							cue.text = cue?.text?.trimEnd?.();
							if (this.opts.includes("singleLine")) {
								cue.text = cue?.text?.replace?.(/\r\n|\r|\n/, " ");
							} else if (this.opts.includes("multiLine")) {
								cue.text = cue?.text?.split?.(/\r\n|\r|\n/);
							}
							Json.body.push(cue);
						};
						break;
				}
			});
			return Json
		};

		stringify(json = this.json) {
			let vtt = [
				json.headers = [json.headers?.type || "", json.headers?.options || ""].flat(Infinity).join(this.lineBreak),
				json.comments = json?.comments?.join?.(this.lineBreak),
				json.style = (json?.style?.length > 0) ? ["STYLE", json.style].join(this.lineBreak) : "",
				json.body = json.body.map(item => {
					if (Array.isArray(item.text)) item.text = item.text.join(this.lineBreak);
					item = `${(item.index) ? item.index + this.lineBreak : ""}${item.timing} ${item?.settings ?? ""}${this.lineBreak}${item.text}`;
					return item;
				}).join(this.lineBreak + this.lineBreak)
			].join(this.lineBreak + this.lineBreak).trim() + this.lineBreak + this.lineBreak;
			return vtt
		};
	})(opts)
}
