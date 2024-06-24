const axios = require('axios');

const url = 'http://127.0.0.1:11434/api/chat';

export default (text, config, promtText, onResult, onClose) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const body = {
        model: 'qwen2:7b',
        messages: [
            {
                role: "system",
                content: "你是一个翻译专家。"
            },
            {
                role: "user",
                content: promtText ? `请分析"${text}"的一般含义，以及在“${promtText}”这段文字中${text}的含义。尽量简略一点,100字以内,返回的内容至少有两个换行。` :
                    `请分析"${text}"的一般含义和用法，如果有词源可以讲一下词源。尽量简略一点,100字以内,返回的内容至少有一次换行。`
            }
        ],
        stream: false,
    };

    axios
        .post(url, body, { headers })
        .then(response => {
            if (response?.data?.message) {
                const allRes = response.data.message.content;
                onResult(allRes);
            } else {
                onResult([]);
            }
        })
        .catch(error => {
            console.error('请求失败:', error);
        })
        .finally(onClose);
};