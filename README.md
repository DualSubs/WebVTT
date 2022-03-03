# WebVTT
an WebVTT&SRT / JSON [ parse | stringify ]  to JSON / WebVTT Converter based JavaScript

一款基于JavaScript的WebVTT&SRT字幕 序列化/反序列化 JSON格式的转换器

Telegram讨论组:[🍟 整点薯条](https://t.me/GetSomeFries)

---

- [WebVTT](#webvtt)
  - [简介](#简介)
  - [功能列表](#功能列表)
  - [todo](#todo)
  - [JSON数据序列结构](#json数据序列结构)
  - [使用方式](#使用方式)
    - [待完成](#待完成)

---

## 简介
  * WebVTT和SRT格式转换为JSON对象，以及对应的JSON对象转换为WebVTT的转换器


## 功能列表
  * WebVTT文件头与数据体分离
  * 文件头：
    * WebVTT文件类型声明
    * CSS 样式声明
    * CSS 样式表
  * 数据体：
    * SRT字幕序号
    * 时间轴
    * 字幕文本框参数(大小，位置，比例)
    * 起始时间戳
    * 结束时间戳
    * UNIX起始时间戳(默认启用，可选)
    * 时间戳秒/毫秒精度转换(默认：秒，可选)
    * 分割多行字幕文本(默认不分割，可选)

## todo
  * 文件头：
    * 地区设置声明
    * 地区设置
    * CSS扩展
  * 数据体：
    * 对话框可选参数
    * 字幕文本可选参数(字幕与背景颜色)
    * 地区设置
    * 其他字幕文本功能

## JSON数据序列结构
    ```json

    {
        headers: {
            fileType: "WEBVTT",
            CSSStyple: "STYLE",
            CSSBoxes: "::cue {
                background-image: linear-gradient(to bottom, dimgray, lightgray);
                color: papayawhip;
            }"
        },
        body: [
            {srtNum:null, timeLine:"00:00:00.000 --> 00:00:04.000", options:"position:10%,line-left align:left size:35%", text:"Where did he go?", startTime: "00:00:00", endTime: "00:00:04", timeStamp: 0, index:0},
            {srtNum:null, timeLine:"00:00:03.000 --> 00:00:06.500", options:"position:90% align:right size:35%", text:"I think he went down this lane.", startTime: "00:00:03", endTime: "00:00:06", timeStamp: 3, index:1},
            {srtNum:null, timeLine:"00:00:04.000 --> 00:00:06.500", options:"position:45%,line-right align:center size:35%", text:"What are you waiting for?", startTime: "00:00:04", endTime: "00:00:06", timeStamp: 4, index:2}
        ]
    }
    
    ```

## 使用方式
### 待完成