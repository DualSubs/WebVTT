// refer: https://www.w3.org/TR/webvtt1/
function WebVTT(opts) {
	return new (class {
		constructor(opts = ["milliseconds", "timeStamp", "singleLine", "\n"]) {
			this.name = "WebVTT v2.1.1";
			this.opts = opts;
			this.lineBreak = (this.opts.includes("\n")) ? "\n" : (this.opts.includes("\r")) ? "\r" : (this.opts.includes("\r\n")) ? "\r\n" : "\n";
			this.vtt = new String;
			this.txt = new String;
			this.json = { headers: {}, note: [], style: "", body: [] };
		};

		parse(vtt = this.vtt) {
			const body_CUE_Regex = (this.opts.includes("milliseconds")) ? /^((?<index>\d+)(\r\n|\r|\n))?(?<timeLine>(?<startTime>[0-9:.,]+) --> (?<endTime>[0-9:.,]+)) ?(?<options>.+)?[^](?<text>[\s\S]*)?$/
				: /^((?<index>\d+)(\r\n|\r|\n))?(?<timeLine>(?<startTime>[0-9:]+)[0-9.,]+ --> (?<endTime>[0-9:]+)[0-9.,]+) ?(?<options>.+)?[^](?<text>[\s\S]*)?$/
			const Array = vtt.split(/\r\n\r\n|\r\r|\n\n/);
			const Json = {
				headers: {},
				note: [],
				style: "",
				body: []
			};

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
						Json.note.push(item);
						break;
					};
					case "STYLE": {
						let cues = item.split(/\r\n|\r|\n/);
						cues.shift();
						Json.style = cues.join(this.lineBreak);
						break;
					};
					default:
						let cue = item.match(body_CUE_Regex)?.groups;
						if (cue) {
							if (Json.headers?.type !== "WEBVTT") {
								cue.timeLine = cue?.timeLine?.replace?.(",", ".");
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
				json.headers = [json.headers?.type || "", json.headers?.options || ""].flat(Infinity).join(this.lineBreak),
				json.note = json?.note?.join?.(this.lineBreak),
				json.style = (json?.style?.length > 0) ? ["STYLE", json.style].join(this.lineBreak) : "",
				json.body = json.body.map(item => {
					if (Array.isArray(item.text)) item.text = item.text.join(this.lineBreak);
					item = `${(item.index) ? item.index + this.lineBreak : ""}${item.timeLine} ${item?.options ?? ""}${this.lineBreak}${item.text}`;
					return item;
				}).join(this.lineBreak + this.lineBreak)
			].join(this.lineBreak + this.lineBreak).trim() + this.lineBreak + this.lineBreak;
			return vtt
		};
	})(opts)
}
