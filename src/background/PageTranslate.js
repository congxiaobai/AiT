import { SparkTTSRecorder } from './Page/SparkConnect';
import { KimiTTSRecorder } from './Page/KimiConnect';
import TongYiConnect from './Page/TongYiConnect';

export const PageTranslate = {
    kimi: kimiTranslateText,
    tongyi: tongyiTranslateText,
    spark: sparkTranslateText
}

async function tongyiTranslateText(textArray, tongyiConfig, promtText, sendResponse) {
    if (!textArray || textArray.length === 0) {
            sendResponse([])
            return
    }
    try {
            TongYiConnect(textArray, tongyiConfig, promtText, (res) => {
                    console.log('translateItemCompleted', res.map(s => s.id).join(';'))
                    sendResponse(res)
                    // chrome.tabs.sendMessage(tabs[0].id, { action: "translateItemCompleted", payload: [payload] })
            }, () => { })

    } catch (error) {
            console.error('Error parsing the translated text:', error);
            return JSON.stringify({ messages: textArray });
    }
}

async function sparkTranslateText(textArray, sparkConfig, promtText, sendResponse) {
    if (!textArray || textArray.length === 0) {
            sendResponse()
            return
    }
    try {
            let WebConnect = new SparkTTSRecorder(sparkConfig);
            let allRes = []
            WebConnect.onEnd = () => {
                    sendResponse(allRes)
            }
            WebConnect.onResult = (res) => {
                    let payload = JSON.parse(res)
                    allRes.push(payload)

            }
            WebConnect.onOpen = () => {
                    if (textArray.length > 0) {
                            WebConnect.webSocketSend(textArray, promtText);
                    }
            }
            WebConnect.start()


    } catch (error) {
            console.error('Error parsing the translated text:', error);
            sendResponse()
            return JSON.stringify({ messages: textArray });
    }
}


async function kimiTranslateText(textArray, kimiConfig, promtText, sendResponse) {
    if (!textArray || textArray.length === 0) {
            return
    }
    try {
            let Record = new KimiTTSRecorder(kimiConfig);
            Record.onEnd = () => {
                    Record.setStatus('close')
            }
            Record.onResult = (res) => {
                    try {
                            let payload = JSON.parse(res)
                            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                                    tabs[0] && chrome.tabs.sendMessage(tabs[0].id, { action: "translateItemCompleted", payload: [payload] }, () => {

                                    });
                            })
                    } catch {

                    }

            }
            Record.sendText(batch, promtText)

    } catch (error) {
            console.error('Error parsing the translated text:', error);
            return JSON.stringify({ messages: textArray });
    }
}