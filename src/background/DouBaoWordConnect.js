// 导入必要的库，如axios用于发送HTTP请
import axios from 'axios';
const url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

export default (text, config, promtText, onResult, onClose) => {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.doubao_apiSecret}`,
    };
    const body = {
        model: config.doubao_endpointId,
        messages: [
            {
                role: 'system',
                content: '你是一个翻译专家。',
            },
            {
                role: 'user',
                content: promtText
                    ? `请分析"${text}"的一般含义，以及在“${promtText}”这段文字中${text}的含义。尽量简略一点,100字以内,返回的内容至少有两个换行。`
                    : `请分析"${text}"的一般含义和用法，如果有词源可以讲一下词源。尽量简略一点,100字以内,返回的内容至少有一次换行。`,
            },
        ],
        stream: false,
    };

    axios
        .post(url, body, {
            headers,
        })
        .then(response => {
            if (response?.data?.choices) {
                const allRes = response.data.choices.map(s => s.message?.content).join('');
                onResult(allRes);
            } else {
                onResult([]);
            }
        });
};
