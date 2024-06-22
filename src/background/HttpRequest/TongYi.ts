// 导入必要的库，如axios用于发送HTTP请
import axios from 'axios';
const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
;

export default (promptArray: {
    role: string,
    content: string
}[], config: any, onResult: (res: any) => void) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.tongyi_apiSecret}`,
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

    axios.post(url, body, {
        headers
    }).then(response => {
        onResult(response)
       
    })

}
