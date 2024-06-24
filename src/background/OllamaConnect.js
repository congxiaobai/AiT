const axios = require('axios');
const { jsonrepair } = require('jsonrepair')

const url = 'http://127.0.0.1:11434/api/chat';
const jsonPattern = /```json\n([\s\S]*?)\n```/;

export default (textArray, config, promtText, onResult, onClose) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const body = {
        model: config.ollama_model,
        messages: [
            {
                role: 'system',
                content: '你是一个翻译专家。尽量避免对一些术语进行翻译。',
            },
            {
                role: 'user',
                content:
                    `下面是一个数组,包含了id和text两个字段。
                请忽略id,将text对应的英文，翻译成中文。然后依然按照数组的格式返回，
                保持其中的字段不变，仅仅把英文替换成中文，使返回的结果能够被JSON反序列化。
                这些数组中的英文，来自于一篇完整的文章，翻译的时候，请前后结合起来翻译。` +
                    `${promtText ? '注意，本文由以下特质，可以参考：' + promtText : ''}` +
                    JSON.stringify(textArray),
            },
        ],
        stream: false,
    };

    axios
        .post(url, body, { headers })
        .then(response => {
            if (response?.data?.message) {
                try {
                    const allRes = response.data.message.content;
                    console.log("allRes: ", allRes);
                    const match = jsonPattern.exec(allRes);
                    if (match) {
                        // 提取并解析JSON字符串
                        const jsonString = match[1];

                        const repair = jsonrepair(jsonString.replace(/'/g, '"'));
                        console.log("repair: ", repair);
                        const jsonData = JSON.parse(repair);
                        console.log('翻译结果:', jsonData);
                        onResult(jsonData);
                    } else {
                        const jsonString = jsonrepair(allRes);
                        console.log("repair: ", jsonString); // 但是修复后仍然有较高的失败率，需要解决这个问题
                        const jsonData = JSON.parse(jsonString);
                        console.log("翻译的结果: ", jsonData);
                        onResult(jsonData);
                    }
                } catch (error) {
                    console.error(error);
                    onResult([]);
                }
            } else {
                console.error(response?.data?.message);
                onResult([]);
            }
        })
        .catch(error => {
            console.error('请求失败:', error);
            onResult(error);
        })
        .finally(onClose);
};