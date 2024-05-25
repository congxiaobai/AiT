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

export class TTSRecorder {
    constructor({
        appId = APPID
    } = {}) {
        this.appId = appId
       
        this.setStatus('init')
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
            let ttsWS  = new WebSocket(url)
            // if ('WebSocket' in window) {
            //     
            // } else if ('MozWebSocket' in window) {
            //     ttsWS = new MozWebSocket(url)
            // } else {
            //     alert('浏览器不支持WebSocket')
            //     return
            // }
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
        console.log(modelDomain)
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
                        "role": "user", "content": "我将提问很多问题，在我输入'#end'之前，请不要断开websokcet连接。中国第一个皇帝是谁？"
                    },{
                        "role": "user", "content": '秦始皇死于哪一年'
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
        // total_res = total_res + resultData
        
        console.log(resultData)
        // 提问失败
        if (jsonData.header.code !== 0) {
            alert(`提问失败: ${jsonData.header.code}:${jsonData.header.message}`)
            console.error(`${jsonData.header.code}:${jsonData.header.message}`)
            return
        }
        if (jsonData.header.code === 0 && jsonData.header.status === 2) {
            this.ttsWS.close()
         
        }
    }
}