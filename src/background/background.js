// import CryptoJS from 'crypto-js';
import { SparkTTSRecorder } from './SparkConnect';
import { KimiTTSRecorder } from './KimiConnect';
import TongYiConnect from './TongYiConnect';
chrome.runtime.onInstalled.addListener(() => {
        console.log('Extension installed and running.');
});


function kimiTranslate(textArray, promtText) {
        chrome?.storage?.sync?.get(['kimi_apiKey'], (kimiConfig) => {
                if (kimiConfig.kimi_apiKey) {
                        kimiTranslateText(textArray, kimiConfig, promtText)
                }
        });

}
function tongyiTranslate(textArray, promtText) {
        chrome?.storage?.sync?.get(['tongyi_apiSecret'], (tongyiConfig) => {
                if (tongyiConfig.tongyi_apiSecret) {
                        tongyiTranslateText(textArray, tongyiConfig, promtText)
                }
        });

}
function sparkTranslate(textArray, promtText) {
        chrome?.storage?.sync?.get(['spark_appId', 'spark_apiSecret', 'spark_apiKey'], (sparkConfig) => {
                if (sparkConfig) {
                        sparkTranslateText(textArray, sparkConfig, promtText)
                }
        });

}

async function tongyiTranslateText(textArray, tongyiConfig, promtText) {
        if (!textArray || textArray.length === 0) {
                return
        }
        try {
                const onResult = (res) => {
                        let payload = JSON.parse(res)

                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                                tabs[0] && chrome.tabs.sendMessage(tabs[0].id, { action: "translateItemCompleted", payload: [payload] }, () => {

                                });
                        })
                }
                TongYiConnect(textArray, tongyiConfig, promtText, onResult, () => { })
        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: textArray });
        }
}

async function sparkTranslateText(textArray, sparkConfig, promtText) {
        if (!textArray || textArray.length === 0) {
                return
        }
        try {
                let WebConnect = new SparkTTSRecorder(sparkConfig);

                WebConnect.onEnd = () => {
                        WebConnect.setStatus('close')
                }

                WebConnect.onResult = (res) => {
                        try {
                                let payload = JSON.parse(res)
                                console.log('翻译成功23', JSON.parse(res));
                                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                                        tabs[0] && chrome.tabs.sendMessage(tabs[0].id, { action: "translateItemCompleted", payload: [payload] }, () => {

                                        });
                                })
                        } catch {

                        }

                }
                WebConnect.onOpen = () => {
                        if (textArray.length > 0) {
                                WebConnect.webSocketSend(textArray, promtText);
                        }
                }
                WebConnect.start()


        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: textArray });
        }
}
async function kimiTranslateText(textArray, kimiConfig, promtText) {
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "translateContent" && request.text) {
                chrome?.storage?.sync?.get(['trans_modal'], (items) => {
                        if (items.trans_modal === 'spark') {
                                sparkTranslate(request.text, request.promtText)
                        }
                        else if (items.trans_modal === 'kimi') {
                                kimiTranslate(request.text, request.promtText)
                        }
                        else if (items.trans_modal === 'tongyi') {
                                tongyiTranslate(request.text, request.promtText)
                        }
                })
                return true; // Indicates an asynchronous response is expected
        }
        sendResponse()
});
