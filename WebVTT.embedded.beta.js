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
			const body_CUE_Regex = (this.opts.includes("milliseconds")) ? /^((?<srtNum>\d+)(\r\n|\r|\n))?(?<timeLine>(?<startTime>[0-9:.,]+) --> (?<endTime>[0-9:.,]+)) ?(?<options>.+)?[^](?<text>[\s\S]*)?$/
				: /^((?<srtNum>\d+)(\r\n|\r|\n))?(?<timeLine>(?<startTime>[0-9:]+)[0-9.,]+ --> (?<endTime>[0-9:]+)[0-9.,]+) ?(?<options>.+)?[^](?<text>[\s\S]*)?$/
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
			const Json = {
				headers: {},
				note: [],
				style: "",
				body: []
			};

			Array.forEach((item, i) => {
				item = item.trim();
				$.log(`🚧 ${$.name}`, `item.substring(0, 5).trim(): ${item.substring(0, 5).trim()}`);
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
			$.log(`🚧 ${this.name}, parse WebVTT`, `Json.headers: ${JSON.stringify(Json.headers)}`, "");
			$.log(`🚧 ${this.name}, parse WebVTT`, `Json.note: ${JSON.stringify(Json.note)}`, "");
			$.log(`🚧 ${this.name}, parse WebVTT`, `Json.style: ${JSON.stringify(Json.style)}`, "");
			$.log(`🚧 ${this.name}, parse WebVTT`, `Json.body: ${JSON.stringify(Json.body)}`, "");

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
				json.headers = [json.headers?.type || "", json.headers?.options || ""].flat(Infinity).join(this.newLine),
				json.note = (json.note ?? "").join(this.newLine),
				json.style = json.style ?? "",
				json.body = json.body.map(item => {
					if (Array.isArray(item.text)) item.text = item.text.join(this.newLine);
					item = `${(item.srtNum) ? item.srtNum + this.newLine : ""}${item.timeLine} ${item?.options ?? ""}${this.newLine}${item.text}`;
					return item;
				}).join(this.newLine + this.newLine)
			].join(this.newLine + this.newLine).trim();
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
