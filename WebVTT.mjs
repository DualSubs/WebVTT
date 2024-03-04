// refer: https://www.w3.org/TR/webvtt1/
export default class WebVTT {
	static name = "WebVTT";
	static version = "2.2.0";
	static about = () => console.log(`\n🟧 ${this.name} v${this.version}\n`);

	static parse(vtt = new String, options = { milliseconds: true, timeStamp: true, line: "single", lineBreak: "\n" }) {
		const WebVTTCueRegex = (options.milliseconds) ? /^((?<index>\d+)(\r\n|\r|\n))?(?<timing>(?<startTime>[0-9:.,]+) --> (?<endTime>[0-9:.,]+)) ?(?<settings>.+)?[^](?<text>[\s\S]*)?$/
			: /^((?<index>\d+)(\r\n|\r|\n))?(?<timing>(?<startTime>[0-9:]+)[0-9.,]+ --> (?<endTime>[0-9:]+)[0-9.,]+) ?(?<settings>.+)?[^](?<text>[\s\S]*)?$/
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
					Json.style = cues.join(options.lineBreak);
					break;
				};
				default:
					let cue = item.match(WebVTTCueRegex)?.groups;
					if (cue) {
						if (Json.headers?.type !== "WEBVTT") {
							cue.timing = cue?.timing?.replace?.(",", ".");
							cue.startTime = cue?.startTime?.replace?.(",", ".");
							cue.endTime = cue?.endTime?.replace?.(",", ".");
						}
						if (options.timeStamp) {
							let ISOString = cue?.startTime?.replace?.(/(.*)/, "1970-01-01T$1Z")
							cue.timeStamp = (options.milliseconds) ? Date.parse(ISOString) : Date.parse(ISOString) / 1000;
						}
						cue.text = cue?.text?.trimEnd?.();
						switch (options.line) {
							case "single":
								cue.text = cue?.text?.replace?.(/\r\n|\r|\n/, " ");
								break;
							case "multi":
								cue.text = cue?.text?.split?.(/\r\n|\r|\n/);
								break;
						};
						Json.body.push(cue);
					};
					break;
			}
		});
		return Json;
	};

	static stringify(json = { headers: {}, comments: [], style: "", body: [] }, options = { milliseconds: true, timeStamp: true, line: "single", lineBreak: "\n" }) {
		let vtt = [
			json.headers = [json.headers?.type || "", json.headers?.options || ""].flat(Infinity).join(options.lineBreak),
			json.comments = json?.comments?.join?.(options.lineBreak),
			json.style = (json?.style?.length > 0) ? ["STYLE", json.style].join(options.lineBreak) : "",
			json.body = json.body.map(item => {
				if (Array.isArray(item.text)) item.text = item.text.join(options.lineBreak);
				item = `${(item.index) ? item.index + options.lineBreak : ""}${item.timing} ${item?.settings ?? ""}${options.lineBreak}${item.text}`;
				return item;
			}).join(options.lineBreak + options.lineBreak)
		].join(options.lineBreak + options.lineBreak).trim() + options.lineBreak + options.lineBreak;
		return vtt;
	};
};
