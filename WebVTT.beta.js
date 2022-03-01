// refer: https://www.w3.org/TR/webvtt1/

function WebVTT(name, opts) {
	return new (class {
		constructor(name, opts) {
			this.name = name
			Object.assign(this, opts)
		};

		parse(vtt = new String, options = ["timeStamp"]) {
			$.log(`🚧 ${$.name}, parse WebVTT`, "");
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

			// 数组化srt/webVTT格式的Regex，预留webVTT的options以便未来修改字幕属性
			//const webVTT_Regex = /^(?<srtNum>\d+)?[(\r\n)\r\n]?(?<timeLine>(?<timeStamp>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d --> (?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d) ?(?<options>.*)?[(\r\n)\r\n](?<text>.+)/
			const webVTT_headers_Regex = /(WEBVTT)?[(\r\n)\r\n]{2,}?(?<CSSboxes>.*::cue(-region)?\(?.*\)?(?: ?{.+})?[(\r\n)\r\n]{2,})?/
			const webVTT_body_Regex = (options.includes("ms")) ? /^(?<srtNum>\d+)?[(\r\n)\r\n]?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d) --> (?<endTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d)) ?(?<options>.+)?[(\r\n)\r\n](?<text>(?:.+)[(\r\n)\r\n]?(?:.+)?)/
				: /^(?<srtNum>\d+)?[(\r\n)\r\n]?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d --> (?<endTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d) ?(?<options>.+)?[(\r\n)\r\n](?<text>(?:.+)[(\r\n)\r\n]?(?:.+)?)/
			$.log(`🚧 ${$.name}, parse WebVTT`, `webVTT_Regex内容: ${webVTT_Regex}`, "");
			// 使用map映射对数组化的字幕进行正则命名组筛选
			json.body = json.body.map(item => item = item.match(webVTT_body_Regex)?.groups ?? "");
			// 或者用forEach实现
			/*
			json.body.forEach((item, i) => {
				json.body[i] = item.match(webVTT_Regex)?.groups ?? "";
			});
			*/
			// 数组去空(不符合正则筛选的数据)
			json.body = json.body.filter(Boolean);
			// 使用map映射对JSON字幕进行格式化
			json.body = json.body.map((item, i) => {
				// 加入索引号方便文本传输翻译字幕
				item.index = i;
				// SRT格式字幕转换时间分隔符
				if (json.headers?.[0] !== "WEBVTT") {
					item.timeLine = item.timeLine.replace(",", ".");
					item.startTime = item.startTime.replace(",", ".");
					item.endTime = item.endTime.replace(",", ".");
				}
				// 是否包含UNIX时间戳
				if (options.includes("timeStamp")) {
					let ISOString = item.startTime.replace(/(.*)/, "1970-01-01T$1Z")
					item.timeStamp = options.includes("ms") ? Date.parse(ISOString) : Date.parse(ISOString) / 1000;
				}
				// 是否将多行文本分割为数组,方便交替插入文本
				if (options.includes("multiText")) {
					// \r\n, \r, \n 是三种不同系统的换行方式
					item.text = item.text.split(/[(\r\n)\r\n]/);
				}
				return item
			});
			/*
			// 时间: SRT的逗号替换为WebVTT的句号
			if (json.headers[0] !== "WEBVTT") json.body.forEach((item, i) => {
				json.body[i].timeLine = item.timeLine.replace(",", ".");
				json.body[i].startTime = item.startTime.replace(",", ".");
			});
			// 时间: 转换为ISO标准格式再转为UNIX时间戳的数字对象再除以1000以变更为单位秒
			if (options.includes("timeStamp")) json.body.forEach((item, i) => {
				let toISOstring = item.startTime.replace(/(.*)/, "1970-01-01T$1Z")
				json.body[i].timeStamp = Date.parse((options.includes("milliseconds")) ? toISOstring : toISOstring / 1000)
			});
			// 文本: 分割多行文本为数组
			if (options.includes("multiText")) json.body.forEach((item, i) => {
				json.body[i].text = item.text.split(/[(\r\n)\r\n]/); // \r\n, \r, \n 是三种不同系统的换行方式
			});
			*/
			//$.log(`🚧 ${$.name}, parse WebVTT`, "json.body.map(item => item.match(webVTT_Regex)?.groups ?? \"\")", `json.body内容: ${JSON.stringify(json.body)}`, "");
			return json
		};

		stringify(json = { headers: new Array, body: new Array }, options = ["milliseconds", "\n"]) {
			const newLine = (options.includes("\n")) ? "\n" : (options.includes("\r")) ? "\r" : (options.includes("\r\n")) ? "\r\n" : "\n";
			let vtt = [
				json.headers = (json.headers?.[0] == "WEBVTT") ? [json.headers[0], json.headers[1] + json.headers[2]].join(newLine + newLine) : "WEBVTT",
				json.body = json.body.map(item => {
					if (Array.isArray(item.text)) item.text = item.text.join(newLine);
					item = `${item.timeLine} ${item.options}${newLine}${item.text}`;
					return item;
				}).join(newLine + newLine)
			].join(newLine + newLine);
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
	})(name, opts)
}