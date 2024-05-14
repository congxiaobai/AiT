import CryptoJS from 'crypto-js';

chrome.runtime.onInstalled.addListener(() => {
        console.log('Extension installed and running.');
});


const basePrompt = "以下的内容是英文的，请翻译成中文，并按照输入的格式输出，请严格按照格式输出，不要输出其他内容。";

let runningTotalRequest = 0;
let WebConnect = null;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "translate") {
                translateText(request.text).then(translatedText => {
                        sendResponse({ translatedText: translatedText });
                }).catch(error => {
                        sendResponse(request.text);
                });
                return true; // Indicates an asynchronous response is expected
        }
});

async function translateText(textArray) {
        try {
                if (!WebConnect) {
                        const tmp = `host:${}\ndate:${new Date().toUTCString()}\nGET /v1.1/chat HTTP/1.1`;
                        let APIKey = '52c0d2a4f3915462b88f0decc16532d1'
                        let APISecret = 'ZDkwZjEyYzcxMDRkOTM0Zjk4ODk2ZmY1'
                        let tmp_sha = CryptoJS.HmacSHA256(tmp, APISecret).toString(CryptoJS.enc.Utf8);
                        // 使用TextEncoder编码
                        const encoder = new TextEncoder();
                        const utf8Bytes = encoder.encode(tmp_sha);

                        // 将UTF-8字节转换为Base64
                        const signature = btoa(String.fromCharCode(...utf8Bytes));

                        authorization_origin = `api_key='{${APIKey}}', algorithm='hmac-sha256', headers='host date request-line', signature='{${signature}}'`

                        WebConnect = new WebSocket('wss://spark-api.xf-yun.com/v3.5/chat', "protocolOne",
                                {
                                        "header": {
                                                "app_id": "8f3e1a8e",

                                        },
                                        "parameter": {
                                                "chat": {
                                                        "domain": "generalv3.5",
                                                        "temperature": 0.5,
                                                        "max_tokens": 1024,
                                                }
                                        },
                                        "payload": {
                                                "message": {
                                                        "text": [
                                                                { "role": "system", "content": "你现在是一个英文专家，请翻译下面的文字" },

                                                        ]
                                                }
                                        }
                                }
                        );
                        WebConnect.onopen = (event) => {
                                WebConnect.send(textArray);
                        }
                }


        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: textArray });
        }
}
