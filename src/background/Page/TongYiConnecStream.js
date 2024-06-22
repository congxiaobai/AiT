// 导入必要的库，如axios用于发送HTTP请
import axios from 'axios';
const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export default (textArray, config, promtText, onResult, onClose) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.tongyi_apiSecret}`, // 使用process.env访问环境变量
        'X-DashScope-SSE': 'enable',
        'Accept': 'text/event-stream',
        responseType: 'stream'
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
            incremental_output: true,
            result_format: "message"
        }
    };


    fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }).then(response => {
        const reader = response.body.getReader();
        let allMessage = [];

        function processStream({ done, value }) {
            // 当没有更多数据时，done为true
            if (done) {
                console.log('Stream complete');
                return;
            }

            // 处理解析后的数据块，例如将Uint8Array转换为字符串
            const chunkText = new TextDecoder().decode(value);

            // 使用正则表达式找到"data:"后面直到换行符的JSON字符串部分
            const dataRegex = /data:(.*?)(?=\n|$)/s;
            const jsonDataMatch = chunkText.match(dataRegex);
            if (jsonDataMatch) {
                const jsonString = jsonDataMatch[1].trim(); // 移除前导和尾随的空白字符
                try {
                    // 将找到的字符串解析为JSON对象
                    const jsonData = JSON.parse(jsonString);

                    // 从JSON对象中提取content字段的值
                    const tmp = jsonData.output.choices[0].message.content;
                    if (tmp) {
                        for (let i = 0; i < tmp.length; i++) {
                            if (tmp[i] === '{' && allMessage.length === 0) {
                                allMessage.push('{')
                                continue;
                            }
                            if (allMessage[0] === '{' && tmp[i] !== '}') {
                                allMessage.push(tmp[i]);
                                continue;
                            }
                            if (tmp[i] === '}' && allMessage[0] === '{') {
                                allMessage.push('}')
                                onResult(allMessage.join(''));
                                allMessage = [];
                                continue;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            } else {
                console.log('Data not found in the text.');
            }

            // 继续读取流
            return reader.read().then(processStream);
        }
        return reader.read().then(processStream);
    }).catch(err => {
        console.log({ err })
    });
    // axios.post(url, body, { headers})
    //     .then(response => {
    //        console.log(response.data)
    //     })
    //     .catch(error => {
    //         console.error('请求出错：', error);

    //     });
}
