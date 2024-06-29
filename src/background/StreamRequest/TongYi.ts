// 导入必要的库，如axios用于发送HTTP请
const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export default (promptArray: {
    role: string,
    content: string
}[], config: any, onResult: (res: any) => void) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.tongyi_apiKey}`, // 使用process.env访问环境变量
        'X-DashScope-SSE': 'enable',
        'Accept': 'text/event-stream',
        responseType: 'stream'
    };
    const body = {
        model: "qwen-turbo",
        input: {
            messages: promptArray
        },
        parameters: {
            incremental_output: true,
            result_format: "message"
        }
    };


    fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }).then(response => {
        if (!response.body) {
            return
        }
        const reader = response.body.getReader();
        let allMessage: string[] = [];

        const processStream = ({ done, value }: {
            done: boolean,
            value: Uint8Array
        }): any => {
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
                                console.log({ allMessage: allMessage.join('') })
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
            return reader.read().then(processStream as any);
        }
        return reader.read().then(processStream as any);
    }).catch(err => {
        console.log({ err })
    });

}