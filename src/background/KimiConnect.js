

import OpenAI from "openai";
let runnerQueue = [];
let maxRunners = 1;

function schedule() {
    while (runnerQueue.length > 0 && maxRunners > 0) {
        const task = runnerQueue.shift();
        maxRunners--;
        
        task().then(() => {
            maxRunners++;
            schedule();
        });
    }
}

export class KimiTTSRecorder {
    constructor({
        kimi_apiKey
    } = {}) {
        this.kimi_apiKey = kimi_apiKey;
    }    // 连接websocket
    // websocket发送数据
    async sendText(items, promtText) {
        const task = async () => {
            this.ttsWS = new OpenAI({
                apiKey: this.kimi_apiKey,
                baseURL: "https://api.moonshot.cn/v1",
                dangerouslyAllowBrowser: true,

            });
            this.total_res = []

            const completion = await this.ttsWS.chat.completions.create({
                model: "moonshot-v1-8k",
                max_tokens: 1024 * 4,
                messages: [{
                    role: "system", content: "你是 一个翻译专家，能精通各行各业的术语进行翻译。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
                    role: "user", content: `下面是一个数组,包含了id和text两个字段。
                    请忽略id,将text对应的英文，翻译成中文。然后依然按照数组的格式返回，
                    保持其中的字段不变，仅仅把英文替换成中文，使返回的结果能够被JSON反序列化。
                    这些数组中的英文，来自于一篇完整的文章，翻译的时候，请前后结合起来翻译。` + `${promtText ? '注意，本文由以下特质，可以参考：' + promtText : ''}` + JSON.stringify(items)
                }],
                temperature: 0.3
            });

            const tmp = completion.choices[0]?.message?.content;
            let total_res = []
            if (tmp) {
                for (let i = 0; i < tmp.length; i++) {
                    if (tmp[i] === '{' && total_res.length === 0) {
                        total_res.push('{')
                        continue;
                    }
                    if (total_res[0] === '{' && tmp[i] !== '}') {
                        total_res.push(tmp[i]);
                        continue;
                    }
                    if (tmp[i] === '}' && total_res[0] === '{') {
                        total_res.push('}')
                        this.onResult && this.onResult(total_res.join(''));
                        total_res = [];
                        continue;
                    }
                }
            }

        };
        runnerQueue.push(task);
        if (runnerQueue.length === 1) {
            schedule(); // 确保当首次添加任务时开始调度
        }
    }
}