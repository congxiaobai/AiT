import CryptoJS from 'crypto-js'
import './App.css'

// 地址必须填写，代表着大模型的版本号！！！！！！！！！！！！！！！！
let httpUrl = new URL("https://spark-api.xf-yun.com/v3.5/chat");
let modelDomain; // V1.1-V3.5动态获取，高于以上版本手动指定
//APPID，APISecret，APIKey在https://console.xfyun.cn/services/cbm这里获取
const APPID = '8f3e1a8e'
const API_SECRET = 'ZDkwZjEyYzcxMDRkOTM0Zjk4ODk2ZmY1'
const API_KEY = '52c0d2a4f3915462b88f0decc16532d1'

var total_res = "";

function getWebsocketUrl() {
    // console.log(httpUrl.pathname)
    // 动态获取domain信息
    switch (httpUrl.pathname) {
        case "/v1.1/chat":
            modelDomain = "general";
            break;
        case "/v2.1/chat":
            modelDomain = "generalv2";
            break;
        case "/v3.1/chat":
            modelDomain = "generalv3";
            break;
        case "/v3.5/chat":
            modelDomain = "generalv3.5";
            break;
    }

    return new Promise((resolve, reject) => {
        var apiKey = API_KEY
        var apiSecret = API_SECRET


        var url = 'wss://' + httpUrl.host + httpUrl.pathname

        // console.log("我打印的" + httpUrl.host)
        // console.log("我打印的" + httpUrl.pathname)

        var host = location.host
        var date = new Date().toGMTString()
        var algorithm = 'hmac-sha256'
        var headers = 'host date request-line'
        var signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${httpUrl.pathname} HTTP/1.1`
        var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
        var signature = CryptoJS.enc.Base64.stringify(signatureSha)
        var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
        var authorization = btoa(authorizationOrigin)
        url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
        resolve(url)
    })
}

class TTSRecorder {
    constructor({
        appId = APPID
    } = {}) {
        this.appId = appId
        this.status = 'init'
    }

    // 修改状态
    setStatus(status) {
        this.onWillStatusChange && this.onWillStatusChange(this.status, status)
        this.status = status
    }

    // 连接websocket
    connectWebSocket() {
        this.setStatus('ttsing')
        return getWebsocketUrl().then(url => {
            let ttsWS
            if ('WebSocket' in window) {
                ttsWS = new WebSocket(url)
            } else if ('MozWebSocket' in window) {
                ttsWS = new MozWebSocket(url)
            } else {
                alert('浏览器不支持WebSocket')
                return
            }
            this.ttsWS = ttsWS
            ttsWS.onopen = e => {
                this.webSocketSend()
            }
            ttsWS.onmessage = e => {
                this.result(e.data)
            }
            ttsWS.onerror = e => {
                clearTimeout(this.playTimeout)
                this.setStatus('error')
                alert('WebSocket报错，请f12查看详情')
                console.error(`详情查看：${encodeURI(url.replace('wss:', 'https:'))}`)
            }
            ttsWS.onclose = e => {
                console.log(e)
            }
        })
    }


    // websocket发送数据
    webSocketSend() {
        const input_text = document.getElementById('input_text');
     
        var params = {
            "header": {
                "app_id": this.appId, "uid": "fd3f47e4-d"
            }, "parameter": {
                "chat": {
                    "domain": modelDomain, "temperature": 0.5, "max_tokens": 1024
                }
            }, "payload": {
                "message": {
                    "text": [{
                        "role": "user", "content": "中国第一个皇帝是谁？"
                    }, {
                        "role": "assistant", "content": "秦始皇"
                    }, {
                        "role": "user", "content": "秦始皇修的长城吗"
                    }, {
                        "role": "assistant", "content": "是的"
                    }, {
                        "role": "user", "content":input_text.value
                    }]
                }
            }
        }
        this.ttsWS.send(JSON.stringify(params))
    }

    start() {
        total_res = ""; // 请空回答历史
        this.connectWebSocket()
    }

    // websocket接收数据的处理
    result(resultData) {
        let jsonData = JSON.parse(resultData)
        if(jsonData?.payload?.choices?.text[0]){
            total_res = total_res + jsonData?.payload?.choices?.text[0]?.content

        }

        const output_text = document.getElementById('output_text');
        if(output_text){
            output_text.value = total_res;
        }
         console.log(resultData)
        // 提问失败
        if (jsonData.header.code !== 0) {
            alert(`提问失败: ${jsonData.header.code}:${jsonData.header.message}`)
            console.error(`${jsonData.header.code}:${jsonData.header.message}`)
            return
        }
        if (jsonData.header.code === 0 && jsonData.header.status === 2) {
            this.ttsWS.close()
            bigModel.setStatus("init")
        }
    }
}

// ======================开始调用=============================
let bigModel = new TTSRecorder()



bigModel.onWillStatusChange = function (oldStatus, status) {
    // 可以在这里进行页面中一些交互逻辑处理：按钮交互等
    // 按钮中的文字
    let btnState = {
        init: '立即提问', ttsing: '回答中...'
    }
    const audioCtrlBtn = document.querySelector('.audio-ctrl-btn');
    if (audioCtrlBtn) {
        audioCtrlBtn.classList.remove(oldStatus);
        audioCtrlBtn.classList.add(status);
        audioCtrlBtn.textContent = btnState[status];
    }


}
const audioCtrlBtn = document.querySelector('.audio-ctrl-btn');
if (audioCtrlBtn) {
    audioCtrlBtn.addEventListener('click', function () {
        if (['init', 'endPlay', 'errorTTS'].indexOf(bigModel.status) > -1) {
            bigModel.start();
        }
    });
}

// 使用原生的事件监听，同时修复文本设置
const inputText = document.getElementById('input_text');
if (inputText) {
    inputText.addEventListener('input propertychange', function () {
        inputText.value = this.value;
    });
}