// 导入必要的库，如axios用于发送HTTP请
import axios from 'axios';
const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
;

export default async (promptArray: {
    role: string,
    content: string
}[], config: any) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.tongyi_apiKey}`,
    };
    const body = {
        model: "qwen-turbo",
        input: {
            messages: promptArray
        },
        parameters: {
            result_format: "message"
        }
    };

    const response = await axios.post(url, body, {
        headers
    })
    return response
}
