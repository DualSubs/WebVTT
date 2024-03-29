// refer: https://www.w3.org/TR/webvtt1/
// refer: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
function WebVTT(opts) {
	return new (class {
		constructor(opts = ["milliseconds", "timeStamp", "singleLine", "\n"]) {
			this.name = "WebVTT v2.1.4";
			this.opts = opts;
			this.lineBreak = (this.opts.includes("\n")) ? "\n" : (this.opts.includes("\r")) ? "\r" : (this.opts.includes("\r\n")) ? "\r\n" : "\n";
			this.vtt = new String;
			this.json = { headers: {}, comments: [], style: "", body: [] };
		};

		parse(vtt = this.vtt) {
			$.log(`🚧 ${this.name}, parse WebVTT`, "");
			// 使用[^]而非[(\r\n)\r\n]来匹配换行符 执行效率提高一倍 https://stackoverflow.com/a/16119722
			// 数组化srt/webVTT格式的headers的Regex，预留webVTT的CSSboxes以便未来修改字幕样式
			// .*::cue.*(\(.*\))?((\n|.)*})?
			// .*::cue.*(?:\(.*\))?(?:(?:\n|.)*})?
			/***************** v1.0.0-beta *****************/
			//const webVTT_headers_Regex = /(?<fileType>WEBVTT)?[^]{2}?(?<CSSStyle>STYLE)[^]/;
			/***************** v1.1.0-beta *****************/
			//const webVTT_headers_Regex = /^(?:(?<fileType>WEBVTT)[^][^])?(?:(?<CSSStyle>STYLE)[^](?<CSSboxes>.*)[^][^])?/;
			/***************** v1.2.0 *****************/
			//const webVTT_headers_Regex = /^(?:(?<fileType>WEBVTT)[^][^])?(?:(?<CSSStyle>STYLE)[^](?<CSSboxes>.*::cue.*(?:\(.*\))?(?:(?:\n|.)*})?)[^][^])?/;
			/***************** v1.3.0-beta *****************/
			//const headers_WEBVTT_Regex = /^(?<fileType>WEBVTT)?[^](?<Xoptions>.+[^])*/;
			//const headers_STYLE_Regex = /^(?<Style>STYLE)[^](?<Boxes>.*::cue.*(\(.*\))?((\n|.)*}$)?)/m;
			//const headers_STYLE_Regex = /^(?<CSSStyle>STYLE)[^](?<CSSboxes>.*::cue.*(?:\(.*\))?(?:(?:\n|.)*}$)?)/m;
			//const webVTT_headers_Regex = /^(?<fileType>WEBVTT)?[^](?<Xoptions>X-.+[^])*[^]((?<CSSStyle>STYLE)[^](?<CSSboxes>.*::cue.*(?:\(.*\))?(?:(?:\n|.)*})*)[^][^])?/;
			//$.log(`🚧 ${this.name}, parse WebVTT`, `webVTT_Regex内容: ${webVTT_headers_Regex}`, "");
			//$.log(`🚧 ${this.name}, parse WebVTT`, `vtt.match(webVTT_headers_Regex)内容: ${vtt.match(webVTT_headers_Regex)}`, "");
			//$.log(`🚧 ${this.name}, parse WebVTT`, `vtt.match(webVTT_headers_Regex).groups内容: ${vtt.match(webVTT_headers_Regex).groups}`, "");

			// 数组化srt/webVTT格式的body的Regex，预留webVTT的options以便未来修改字幕属性
			// matchAll版
			//const webVTT_body_Regex = (this.opts.includes("milliseconds")) ? /(?<srtNum>\d+)?[^]?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d) --> (?<endTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d)) ?(?<options>.+)?[^](?<text>.+)[^][^]/g
			//	: /(?<srtNum>\d+)?[^]?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d --> (?<endTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d) ?(?<options>.+)?[^](?<text>.+)[^][^]/g;
			// match版
			//const body_CUE_Regex = (this.opts.includes("milliseconds")) ? /^(?:(?<srtNum>\d+)[(\r\n)\r\n])?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d) --> (?<endTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d)) ?(?<options>.+)?[^](?<text>.*[^]*)$/
			//	: /^(?:(?<srtNum>\d+)[(\r\n)\r\n])?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d --> (?<endTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d) ?(?<options>.+)?[^](?<text>.*[^]*)$/
			//const body_CUE_Regex = (this.opts.includes("milliseconds")) ? /^((?<srtNum>\d+)(\r\n|\r|\n))?(?<timeLine>(?<startTime>(\d\d:)?\d\d:\d\d[\.,]\d\d\d) --> (?<endTime>(\d\d:)?\d\d:\d\d[\.,]\d\d\d)) ?(?<options>.+)?[^](?<text>[\s\S]*)$/
			//: /^((?<srtNum>\d+)(\r\n|\r|\n))?(?<timeLine>(?<startTime>(\d\d:)?\d\d:\d\d)[\.,]\d\d\d --> (?<endTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d) ?(?<options>.+)?[^](?<text>[\s\S]*)$/
			/***************** v1.8.0-beta *****************/
			const WebVTT_cue_Regex = (this.opts.includes("milliseconds")) ? /^((?<index>\d+)(\r\n|\r|\n))?(?<timing>(?<startTime>[0-9:.,]+) --> (?<endTime>[0-9:.,]+)) ?(?<settings>.+)?[^](?<text>[\s\S]*)?$/
				: /^((?<index>\d+)(\r\n|\r|\n))?(?<timing>(?<startTime>[0-9:]+)[0-9.,]+ --> (?<endTime>[0-9:]+)[0-9.,]+) ?(?<settings>.+)?[^](?<text>[\s\S]*)?$/
			//$.log(`🚧 ${this.name}, parse WebVTT`, `webVTT_body_Regex内容: ${webVTT_body_Regex}`, "");
			/***************** v1.0.0-beta *****************/
			/*
			let array = vtt.split(/[(\r\n)\r\n]{2,}/);
			let json = {
				headers: (array[0] == "WEBVTT") ? array.slice(0, 3) : null,
				body: (array[0] == "WEBVTT") ? array.slice(3) : array
			};
			/*
			if (json.body[0] == "WEBVTT") {
				$.log(`🚧 ${$.name}, parse WebVTT`, `is webVTT`, "");
				json.head = json.body.slice(0, 3) // webVTT文件头
				$.log(`🚧 ${$.name}, parse WebVTT`, `json.head内容: ${json.head}`, "");
				json.body = json.body.slice(3) // 去除webVTT文件头后的字幕文件
				//$.log(`🚧 ${$.name}, parse WebVTT`, `json.body内容: ${json.body}`, "");
			}
			*/
			/***************** v1.1.0-beta *****************/
			/*
			// 字符串末位追加两个换行符
			//vtt = vtt + "\n\n"
			// 直接用matchAll构建数组
			let json = {
				headers: vtt.match(webVTT_headers_Regex)?.groups ?? null, //正则
				body: [...vtt.matchAll(webVTT_body_Regex)].filter(Boolean) //正则，去空
			};
			*/
			/***************** v1.2.0-beta *****************/
			// 使用map映射对数组化的字幕进行正则命名组筛选
			//json.body = json.body.map(item => item = item.match(webVTT_body_Regex)?.groups ?? "");
			// 或者用forEach实现
			/*
			json.body.forEach((item, i) => {
				json.body[i] = item.match(webVTT_Regex)?.groups ?? "";
			});
			*/
			/***************** v1.2.0 *****************/
			//let array = vtt.split(/[(\r\n)\r\n]{2,}/);
			/*
			let json = {
				headers: vtt.match(webVTT_headers_Regex)?.groups ?? null,
				body: vtt.split(/[(\r\n)\r\n]{2,}/).map(item => item = item.match(webVTT_body_Regex)?.groups ?? "")
			};
			*/
			/***************** v1.3.0-beta *****************/
			/*
			let json = {
				headers: vtt.match(headers_WEBVTT_Regex)?.groups ?? null,
				CSS: vtt.match(headers_STYLE_Regex)?.groups ?? null,
				body: vtt.split(/\r\n\r\n|\r\r|\n\n/).map(item => {
					//$.log(`🚧 ${$.name}`, `item: ${item}`);
					item = item.match(body_CUE_Regex)?.groups ?? ""
					//$.log(`🚧 ${$.name}`, `${item?.text ?? ""}`, "");
					return item;
				})
			*/
			/***************** v2.0.0 *****************/
			const Array = vtt.split(/\r\n\r\n|\r\r|\n\n/);
			$.log(`🚧 ${$.name}`, `Array: ${Array}`);
			const Json = { headers: {}, comments: [], style: "", body: [] };


			Array.forEach(item => {
				item = item.trim();
				$.log(`🚧 ${$.name}`, `item.substring(0, 5).trim(): ${item.substring(0, 5).trim()}`);
				switch (item.substring(0, 5).trim()) {
					case "WEBVT": {
						let cues = item.split(/\r\n|\r|\n/);
						$.log(`🚧 ${$.name}`, `cues: ${cues}`);
						Json.headers.type = cues.shift();
						Json.headers.options = cues;
						break;
					};
					case "NOTE": {
						//let cues = item.split("NOTE ").trimEnd();
						//$.log(`🚧 ${$.name}`, `cues: ${cues}`);
						//Json.comments = cues;
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
						/***************** v2.0.0 *****************/
						//Json.body[i] = item.match(body_CUE_Regex)?.groups ?? undefined;
						/***************** v2.1.0 *****************/
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
			$.log(`🚧 ${this.name}, parse WebVTT`, `Json.headers: ${JSON.stringify(Json.headers)}`, "");
			$.log(`🚧 ${this.name}, parse WebVTT`, `Json.comments: ${JSON.stringify(Json.comments)}`, "");
			$.log(`🚧 ${this.name}, parse WebVTT`, `Json.style: ${JSON.stringify(Json.style)}`, "");
			$.log(`🚧 ${this.name}, parse WebVTT`, `Json.body: ${JSON.stringify(Json.body)}`, "");

			/***************** v2.0.0 *****************/
			/*
			// 数组去空(不符合正则筛选的数据)
			Json.body = Json.body.filter(Boolean);
			// 使用map映射对JSON字幕进行格式化
			Json.body = Json.body.map((item, i) => {
				// 加入索引号方便文本传输翻译字幕
				item.index = i;
				// SRT格式字幕转换时间分隔符
				// 原版
				//if (Json.headers?.[0] !== "WEBVTT") {
				// 正式版
				if (Json.headers?.type !== "WEBVTT") {
					item.timeLine = item.timeLine.replace(",", ".");
					item.startTime = item.startTime.replace(",", ".");
					item.endTime = item.endTime.replace(",", ".");
				}
				// 是否包含UNIX时间戳
				if (this.opts.includes("timeStamp")) {
					let ISOString = item.startTime.replace(/(.*)/, "1970-01-01T$1Z")
					item.timeStamp = this.opts.includes("milliseconds") ? Date.parse(ISOString) : Date.parse(ISOString) / 1000;
				}
				// 从两头去掉空白字符的字符串
				item.text = item.text?.trim() ?? "_";
				// 是否将多行文本分割为数组，方便未来提供交替插入文本功能
				// \r\n, \r, \n 是三种不同系统的换行方式
				if (this.opts.includes("singleLine")) {
					item.text = item.text.replace(/\r\n|\r|\n/, " ");
				} else if (this.opts.includes("multiLine")) {
					item.text = item.text.split(/\r\n|\r|\n/);
				}
				return item
			});
			*/

			/*
			// 时间: SRT的逗号替换为WebVTT的句号
			if (Json.headers[0] !== "WEBVTT") Json.body.forEach((item, i) => {
				Json.body[i].timeLine = item.timeLine.replace(",", ".");
				Json.body[i].startTime = item.startTime.replace(",", ".");
			});
			// 时间: 转换为ISO标准格式再转为UNIX时间戳的数字对象再除以1000以变更为单位秒
			if (opts.includes("timeStamp")) Json.body.forEach((item, i) => {
				let toISOstring = item.startTime.replace(/(.*)/, "1970-01-01T$1Z")
				Json.body[i].timeStamp = Date.parse((opts.includes("milliseconds")) ? toISOstring : toISOstring / 1000)
			});
			// 文本: 分割多行文本为数组
			if (opts.includes("multiText")) Json.body.forEach((item, i) => {
				Json.body[i].text = item.text.split(/[(\r\n)\r\n]/); // \r\n, \r, \n 是三种不同系统的换行方式
			});
			*/
			//$.log(`🚧 ${this.name}, parse WebVTT`, `Json.headers内容: ${JSON.stringify(Json.headers)}`, "");
			//$.log(`🚧 ${this.name}, parse WebVTT`, `Json.body内容: ${JSON.stringify(Json.body)}`, "");
			return Json
		};

		stringify(json = this.json) {
			$.log(`🚧 ${this.name}, stringify WebVTT`, "");
			//const newLine = (this.opts.includes("\n")) ? "\n" : (this.opts.includes("\r")) ? "\r" : (this.opts.includes("\r\n")) ? "\r\n" : "\n";
			let vtt = [
				//json.headers = json.headers?.fileType || "WEBVTT",
				/***************** v1.0.0-beta *****************/
				//json.headers = (json.headers?.[0] == "WEBVTT") ? json.headers.join(newLine + newLine) : "WEBVTT",
				/***************** v1.2.0 *****************/
				//json.headers = (json?.headers?.CSSStyle) ? ["WEBVTT", "STYLE" + newLine + json.headers.CSSboxes].join(newLine + newLine) : "WEBVTT",
				/***************** v1.3.0-beta *****************/
				//json.headers = [json.headers?.fileType || "WEBVTT", json.headers?.Xoptions || null].join(this.newLine),
				//json.CSS = json.CSS?.Style ? [json.CSS.Style, json.CSS.Boxes].join(this.newLine) : null,
				/***************** v2.0.0 *****************/
				json.headers = [json.headers?.type || "", json.headers?.options || ""].flat(Infinity).join(this.lineBreak),
				json.comments = json?.comments?.join?.(this.lineBreak),
				json.style = (json?.style?.length > 0) ? ["STYLE", json.style].join(this.lineBreak) : "",
				json.body = json.body.map(item => {
					if (Array.isArray(item.text)) item.text = item.text.join(this.lineBreak);
					item = `${(item.index) ? item.index + this.lineBreak : ""}${item.timing} ${item?.settings ?? ""}${this.lineBreak}${item.text}`;
					return item;
				}).join(this.lineBreak + this.lineBreak)
			].join(this.lineBreak + this.lineBreak).trim() + this.lineBreak + this.lineBreak;
			// 按步骤分行写法
			/*
			if (options.includes("cue"))
			json.headers = (json.headers[0] == "WEBVTT") ? json.headers.join(newLine + newLine) : "WEBVTT"
			json.body = json.body.map(item => {
					if (Array.isArray(item.text)) item.text = item.text.join(newLine);
					item = `${item.timeLine} ${item.options}${newLine}${item.text}`.join(newLine + newLine);
					return item;
				})
			json = json.join(newLine + newLine);
			*/
			return vtt
		};
	})(opts)
}
