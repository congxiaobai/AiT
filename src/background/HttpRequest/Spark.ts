import CryptoJS from 'crypto-js';
let httpUrl = new URL("https://spark-api.xf-yun.com/v3.5/chat");
let modelDomain = "generalv3.5"; // V3.5

export function getWebsocketUrl(apiKey: string, apiSecret: string): Promise<string> {

  return new Promise((resolve) => {
    var url = 'wss://' + httpUrl.host + httpUrl.pathname
    var host = location.host
    var date = new Date().toUTCString()
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
export const generateWs = async (promptArray: any, config: any, onEnd: Function, onMessage: Function) => {
  const url = await getWebsocketUrl(config.spark_apiKey, config.spark_apiSecret);
  const ttsWS = new WebSocket(url);

  ttsWS.onopen = () => {
    console.info('WS已连接')
    var params = {
      "header": {
        "app_id": config.spark_appId, "uid": "fd3f47e4-d"
      }, "parameter": {
        "chat": {
          "domain": modelDomain, "temperature": 0.5, "max_tokens": 8191
        }
      }, "payload": {
        "message": {
          "text": promptArray
        }
      }
    }
    ttsWS.send(JSON.stringify(params))
  }
  ttsWS.onclose = () => {
    console.info('WS已关闭')
  }
  ttsWS.onmessage = (e) => {
    const resultData = e.data;
    let jsonData = JSON.parse(resultData);
    let tmp = jsonData?.payload?.choices?.text[0]?.content;
    if (tmp) {
      onMessage(tmp)
    }

    if (jsonData.header.code !== 0) {
      console.error(`${jsonData.header.code}:${jsonData.header.message}`)
      return
    }
    if (jsonData.header.code === 0 && jsonData.header.status === 2) {
      ttsWS.close()
      onEnd()
    }
  }

  return ttsWS;
}

