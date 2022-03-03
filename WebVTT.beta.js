// refer: https://www.w3.org/TR/webvtt1/
function WebVTT(name, opts) {
	return new (class {
		constructor(name, opts) {
			this.name = name
			Object.assign(this, opts)
		};

		parse(vtt = new String, options = ["timeStamp"]) {
			$.log(`🚧 ${$.name}, parse WebVTT`, "");

			// 使用[^]而非[(\r\n)\r\n]来匹配换行符 执行效率提高一倍 https://stackoverflow.com/a/16119722
			// 数组化srt/webVTT格式的headers的Regex，预留webVTT的CSSboxes以便未来修改字幕样式
			// .*::cue.*(\(.*\))?((\n|.)*})?
			// .*::cue.*(?:\(.*\))?(?:(?:\n|.)*})?
			//const webVTT_headers_Regex = /(?<fileType>WEBVTT)?[^]{2}?(?<CSSStyle>STYLE)[^]/;
			//const webVTT_headers_Regex = /^(?:(?<fileType>WEBVTT)[^][^])?(?:(?<CSSStyle>STYLE)[^](?<CSSboxes>.*)[^][^])?/;
			const webVTT_headers_Regex = /^(?:(?<fileType>WEBVTT)[^][^])?(?:(?<CSSStyle>STYLE)[^](?<CSSboxes>.*::cue.*(?:\(.*\))?(?:(?:\n|.)*})?)[^][^])?/;
			//$.log(`🚧 ${$.name}, parse WebVTT`, `webVTT_Regex内容: ${webVTT_headers_Regex}`, "");
			//$.log(`🚧 ${$.name}, parse WebVTT`, `vtt.match(webVTT_headers_Regex)内容: ${vtt.match(webVTT_headers_Regex)}`, "");
			//$.log(`🚧 ${$.name}, parse WebVTT`, `vtt.match(webVTT_headers_Regex).groups内容: ${vtt.match(webVTT_headers_Regex).groups}`, "");

			// 数组化srt/webVTT格式的body的Regex，预留webVTT的options以便未来修改字幕属性
			// matchAll版
			//const webVTT_body_Regex = (options.includes("ms")) ? /(?<srtNum>\d+)?[^]?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d) --> (?<endTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d)) ?(?<options>.+)?[^](?<text>.+)[^][^]/g
			//	: /(?<srtNum>\d+)?[^]?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d --> (?<endTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d) ?(?<options>.+)?[^](?<text>.+)[^][^]/g;
			// match版
			const webVTT_body_Regex = (options.includes("ms")) ? /^(?:(?<srtNum>\d+)[(\r\n)\r\n])?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d) --> (?<endTime>(?:\d\d:)?\d\d:\d\d(?:\.|,)\d\d\d)) ?(?<options>.+)?[^](?<text>.+)/
				: /^(?:(?<srtNum>\d+)[(\r\n)\r\n])?(?<timeLine>(?<startTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d --> (?<endTime>(?:\d\d:)?\d\d:\d\d)(?:\.|,)\d\d\d) ?(?<options>.+)?[^](?<text>.+)/
			//$.log(`🚧 ${$.name}, parse WebVTT`, `webVTT_body_Regex内容: ${webVTT_body_Regex}`, "");

			/***************** 1.0.0版 *****************/
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

			/***************** 正式版 *****************/
			//let array = vtt.split(/[(\r\n)\r\n]{2,}/);
			let json = {
				headers: vtt.match(webVTT_headers_Regex)?.groups ?? null,
				body: vtt.split(/[(\r\n)\r\n]{2,}/).map(item => item = item.match(webVTT_body_Regex)?.groups ?? "")
			};
			// 使用map映射对数组化的字幕进行正则命名组筛选
			//json.body = json.body.map(item => item = item.match(webVTT_body_Regex)?.groups ?? "");
			// 或者用forEach实现
			/*
			json.body.forEach((item, i) => {
				json.body[i] = item.match(webVTT_Regex)?.groups ?? "";
			});
			*/
			// 数组去空(不符合正则筛选的数据)
			json.body = json.body.filter(Boolean);

			/***************** 测试版 *****************/
			/*
			// 字符串末位追加两个换行符
			//vtt = vtt + "\n\n"
			// 直接用matchAll构建数组
			let json = {
				headers: vtt.match(webVTT_headers_Regex)?.groups ?? null, //正则
				body: [...vtt.matchAll(webVTT_body_Regex)].filter(Boolean) //正则，去空
			};
			*/

			// 使用map映射对JSON字幕进行格式化
			json.body = json.body.map((item, i) => {
				// 加入索引号方便文本传输翻译字幕
				item.index = i;
				// SRT格式字幕转换时间分隔符
				// 原版
				//if (json.headers?.[0] !== "WEBVTT") {
				// 正式版
				if (json.headers?.fileType !== "WEBVTT") {
					item.timeLine = item.timeLine.replace(",", ".");
					item.startTime = item.startTime.replace(",", ".");
					item.endTime = item.endTime.replace(",", ".");
				}
				// 是否包含UNIX时间戳
				if (options.includes("timeStamp")) {
					let ISOString = item.startTime.replace(/(.*)/, "1970-01-01T$1Z")
					item.timeStamp = options.includes("ms") ? Date.parse(ISOString) : Date.parse(ISOString) / 1000;
				}
				// 是否将多行文本分割为数组，方便未来提供交替插入文本功能
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
			$.log(`🚧 ${$.name}, parse WebVTT`, `json.headers内容: ${JSON.stringify(json.headers)}`, "");
			$.log(`🚧 ${$.name}, parse WebVTT`, `json.body内容: ${JSON.stringify(json.body)}`, "");
			return json
		};

		stringify(json = { headers: new Object, body: new Array }, options = ["milliseconds", "\n"]) {
			const newLine = (options.includes("\n")) ? "\n" : (options.includes("\r")) ? "\r" : (options.includes("\r\n")) ? "\r\n" : "\n";
			let vtt = [
				// 原版
				//json.headers = (json.headers?.[0] == "WEBVTT") ? json.headers.join(newLine + newLine) : "WEBVTT",
				// 正式版
				json.headers = (json?.headers?.CSSStyle) ? ["WEBVTT", "STYLE" + newLine + json.headers.CSSboxes].join(newLine + newLine) : "WEBVTT",
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
