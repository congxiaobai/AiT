// 地址必须填写，代表着大模型的版本号！！！！！！！！！！！！！！！！
import CryptoJS from 'crypto-js';

let httpUrl = new URL("https://spark-api.xf-yun.com/v3.5/chat");
let modelDomain; // V1.1-V3.5动态获取，高于以上版本手动指定
//APPID，APISecret，APIKey在https://console.xfyun.cn/services/cbm这里获取
const APPID = '8f3e1a8e'
const API_SECRET = 'ZDkwZjEyYzcxMDRkOTM0Zjk4ODk2ZmY1'
const API_KEY = '52c0d2a4f3915462b88f0decc16532d1'
export function getWebsocketUrl() {
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

export class TTSRecorder {
    constructor({
        appId = APPID
    } = {}) {
        this.appId = appId
        this.textArray = [];
        this.setStatus('ready')
    }

    // 修改状态
    setStatus(status) {
        this.status = status
    }

    // 连接websocket
    connectWebSocket() {
        this.setStatus('ttsing')
        return getWebsocketUrl().then(url => {
            let ttsWS = new WebSocket(url)
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
             
                console.error(`详情查看：${encodeURI(url.replace('wss:', 'https:'))}`)
            }
            ttsWS.onclose = e => {
                this.ttsWS =null;
                this.setStatus('ready')
            }
        })
    }


    // websocket发送数据
    webSocketSend() {
        console.log(this.textArray)
        var params = {
            "header": {
                "app_id": this.appId, "uid": "fd3f47e4-d"
            }, "parameter": {
                "chat": {
                    "domain": modelDomain, "temperature": 0.5, "max_tokens": 8191
                }
            }, "payload": {
                "message": {
                    "text": [{
                        "role": "user", "content": "下面是一个数组,包含了id和text两个字段。请忽略id,将text对应的英文，翻译成中文。然后依然按照数组的格式返回，保持其中的字段不变，仅仅把英文替换成中文，使返回的结果能够被JSON反序列化。这些数组中的英文，来自于一篇完整的文章，翻译的时候，请前后结合起来翻译。" + JSON.stringify(this.textArray)
                    }]
                }
            }
        }
        console.log(JSON.stringify(params))
        this.ttsWS.send(JSON.stringify(params))
    }

    start() {
        this.connectWebSocket()
    }

    // websocket接收数据的处理
    result(resultData) {
        let jsonData = JSON.parse(resultData)

        console.log(resultData)
        // 提问失败
        if (jsonData.header.code !== 0) {
            console.error(`${jsonData.header.code}:${jsonData.header.message}`)
            return
        }
        if (jsonData.header.code === 0 && jsonData.header.status === 2) {
            this.onResult&&this.onResult(resultData)
            this.ttsWS.close()
        }
    }
}