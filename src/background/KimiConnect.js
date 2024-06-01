import CryptoJS from 'crypto-js';
let httpUrl = new URL("https://spark-api.xf-yun.com/v3.5/chat");
let modelDomain = "generalv3.5"; // V3.5

export class TTSRecorder {
    constructor({
        kimi_apiKey
    } = {}) {

        this.kimi_apiKey = kimi_apiKey;
    }

    // 修改状态
    setStatus(status) {
        this.status = status
    }

    //s
    setActiveTabID(activeTabId) {
        this.activeTabId = activeTabId
    }
    // 连接websocket
    connectWebSocket() {
        this.setStatus('ttsing')
        this.ttsWS = new OpenAI({
            apiKey: this.kimi_apiKey,
            baseURL: "https://api.moonshot.cn/v1",
        });
    }


    // websocket发送数据
    async webSocketSend(items, promtText) {
        this.total_res = []
        var params = {
            "header": {
                "app_id": this.spark_appId, "uid": "fd3f47e4-d"
            }, "parameter": {
                "chat": {
                    "domain": modelDomain, "temperature": 0.5, "max_tokens": 8191
                }
            }, "payload": {
                "message": {
                    "text": [{
                        "role": "user", "content":
                            
                    }]
                }
            }
        }
        const completion = await this.ttsWS.chat.completions.create({
            model: "moonshot-v1-8k",
            messages: [{
                role: "system", content: "你是 一个翻译专家，能精通各行各业的术语进行翻译。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
                role: "user", content: `下面是一个数组,包含了id和text两个字段。
                请忽略id,将text对应的英文，翻译成中文。然后依然按照数组的格式返回，
                保持其中的字段不变，仅仅把英文替换成中文，使返回的结果能够被JSON反序列化。
                这些数组中的英文，来自于一篇完整的文章，翻译的时候，请前后结合起来翻译。` + `${promtText ? '注意，本文由以下特质，可以参考：' + promtText : ''}` + JSON.stringify(items)
            }],
            temperature: 0.3
        });
        this.ttsWS.send(JSON.stringify(params))
    }

    start() {
        this.connectWebSocket()
    }

    // websocket接收数据的处理
    result(resultData) {
        let jsonData = JSON.parse(resultData);
        if (jsonData?.payload?.choices?.text[0]?.content) {
            let tmp = jsonData?.payload?.choices?.text[0]?.content;
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i] === '{' && this.total_res.length === 0) {
                    this.total_res.push('{')
                    continue;
                }
                if (this.total_res[0] === '{' && tmp[i] !== '}') {
                    this.total_res.push(tmp[i]);
                    continue;
                }
                if (tmp[i] === '}' && this.total_res[0] === '{') {
                    this.total_res.push('}')
                    this.onResult && this.onResult(this.total_res.join(''));
                    this.total_res = [];
                    continue;
                }
            }
        }
        // 提问失败
        if (jsonData.header.code !== 0) {
            console.error(`${jsonData.header.code}:${jsonData.header.message}`)
            return
        }
        if (jsonData.header.code === 0 && jsonData.header.status === 2) {
            this.ttsWS.close()
            this.onEnd && this.onEnd()
        }
    }
}