// 导入必要的库，如axios用于发送HTTP请
import axios from 'axios';
const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const jsonPattern = /```json\n([\s\S]*?)\n```/;

export default (textArray, config, promtText, onResult, onClose) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.tongyi_apiSecret}`,

    };
    const body = {
        model: "qwen-turbo",
        input: {
            messages: [
                {
                    role: "system",
                    content: "你是一个翻译专家。尽量避免对一些术语进行翻译。"
                },
                {
                    role: "user",
                    content: `下面是一个数组,包含了id和text两个字段。
                    请忽略id,将text对应的英文，翻译成中文。然后依然按照数组的格式返回，
                    保持其中的字段不变，仅仅把英文替换成中文，使返回的结果能够被JSON反序列化。
                    这些数组中的英文，来自于一篇完整的文章，翻译的时候，请前后结合起来翻译。` + `${promtText ? '注意，本文由以下特质，可以参考：' + promtText : ''}` + JSON.stringify(textArray)
                }
            ]
        },
        parameters: {
            result_format: "message"
        }
    };

    axios.post(url, body, {
        headers
    }).then(response => {
        if (response?.data?.output?.choices) {
            const allRes =response.data.output.choices.map(s => s.message?.content).join('')
            const match = jsonPattern.exec(allRes);
            if (match) {
                // 提取并解析JSON字符串
                const jsonString = match[1];
                const jsonData = JSON.parse(jsonString.replace(/'/g, '"'));
                onResult(jsonData)
            }
            

        } else {
            onResult([])
        }
    })

}
