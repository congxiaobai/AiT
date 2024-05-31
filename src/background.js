// import CryptoJS from 'crypto-js';
import { TTSRecorder } from './SparkConnect';

chrome.runtime.onInstalled.addListener(() => {
        console.log('Extension installed and running.');
});


let WebConnect = null;
let paddingText = []
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "translateContent" && request.text) {
                console.log('background翻译', request.text)
                translateText(request.text)
                return true; // Indicates an asynchronous response is expected
        }
        sendResponse()
});

async function translateText(textArray) {
        if (!textArray || textArray.length === 0) {
                return
        }
        try {
                if (!WebConnect || !WebConnect.ttsWS) {
                        WebConnect = new TTSRecorder();
                        WebConnect.onEnd = () => {
                                if (paddingText.length > 0) {
                                        WebConnect.webSocketSend(paddingText);
                                        paddingText = []
                                } else {
                                        WebConnect.setStatus('ready')
                                }
                        }
                        WebConnect.onResult = (res) => {
                                console.log({ res })
                                res && chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                                        chrome.tabs.sendMessage(tabs[0].id, { action: "translateItemCompleted", payload: JSON.parse(res) },() => {
                                                console.log('翻译成功23', JSON.parse(res))
                                        });
                                });
                               
                        }
                        WebConnect.onOpen = () => {
                                if (textArray.length > 0) {
                                        WebConnect.webSocketSend(textArray);
                                }
                        }
                        WebConnect.start()
                } else {
                        if (WebConnect.status === 'ready') {
                                WebConnect.webSocketSend(textArray)
                        } else {
                                paddingText = paddingText.concat(textArray)
                        }
                }



        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: textArray });
        }
}
