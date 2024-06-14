// 导入必要的库，如axios用于发送HTTP请
import axios from 'axios';
const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export default (config, promtText, onResult, onClose) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.tongyi_apiKey}`, // 使用process.env访问环境变量
        'X-DashScope-SSE': 'enable',
        'Accept': 'text/event-stream'
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
                    content: promtText
                }
            ]
        },
        parameters: {
            incremental_output: true,
            result_format: "message"
        }
    };
    axios.post(url, body, { headers, responseType: 'stream' })
        .then(response => {
            let data = '';

            response.data.on('data', (chunk) => {
                data += chunk;
                let res = ''
                const pattern = /"content":"(.*?)","role"/g;
                let match;
                console.log(data)
                while ((match = pattern.exec(data)) !== null) {
                    res += match[1]
                }
                res && onResult(res)
            });
            response.data.on('end', () => {
                console.log("\nhttp返回结果：");
                onClose()
            });
        })
        .catch(error => {
            console.error('请求出错：', error);

        });
}
