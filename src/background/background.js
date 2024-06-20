// import CryptoJS from 'crypto-js';
import { SparkTTSRecorder } from './SparkConnect';
import { KimiTTSRecorder } from './KimiConnect';
import { addFavoriteWords } from './FavoriteWords';
import TongYiConnect from './TongYiConnect';
import TongYiWordConnect from './TongYiWordConnect';
import SparkConnectWord from './SparkConnectWord';
chrome.runtime.onInstalled.addListener(() => {
        console.log('Extension installed and running.');
        chrome.contextMenus.create({
                id: 'myExtensionContextMenu',
                title: '翻译',
                contexts: ['selection'], // 可以是['page','image','video','audio','frame','launcher','browser_action','page_action']等，这里设为'all'表示在所有上下文都显示

        }, function () {
                if (chrome.runtime.lastError) {
                        console.error('创建右键菜单时出错:', chrome.runtime.lastError);
                }
        });
});
// 监听上下文菜单项的点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === 'myExtensionContextMenu') {
                // 在此处理点击事件
                console.log('右键菜单被点击');
                chrome.tabs.sendMessage(tab.id, { action: 'contextMenuClicked', selectionText: info.selectionText });
        }
});


const TransConfig = {
        kimi: ['kimi_apiKey'],
        spark: ['spark_apiKey', 'spark_apiSecret', 'spark_appId'],
        tongyi: ['tongyi_apiSecret']
}

const TransRcord = {
        kimi: kimiTranslateText,
        tongyi: tongyiTranslateText,
        spark: sparkTranslateText
}
const TransWordRcord = {
        kimi: kimiWordTranslateText,
        tongyi: tongyiWordTranslateText,
        spark: sparkWordTranslateText
}
async function tongyiWordTranslateText(text, tongyiConfig, promtText, sendResponse) {

        try {
                TongYiWordConnect(text, tongyiConfig, promtText, (res) => {
                       
                        sendResponse(res)
                        addFavoriteWords(text,promtText,res)
                        // chrome.tabs.sendMessage(tabs[0].id, { action: "translateItemCompleted", payload: [payload] })
                }, () => { })

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: text });
        }
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
async function sparkWordTranslateText(textArray, sparkConfig, promtText, sendResponse) {
        try {
                let WebConnect = new SparkConnectWord(sparkConfig);
                WebConnect.onEnd = (allRes) => {
                        sendResponse(allRes)
                }
                WebConnect.onResult = (res) => {
                
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
async function kimiWordTranslateText(textArray, kimiConfig, promtText, sendResponse) {
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "translateContent" && request.text) {
                chrome?.storage?.sync?.get(['trans_modal'], (items) => {
                        const configKey = TransConfig[items.trans_modal];
                        chrome?.storage?.sync?.get(configKey, (config) => {
                                if (config) {
                                        TransRcord[items.trans_modal](request.text, config, request.promtText, sendResponse)
                                }
                        })
                })
                return true; // Indicates an asynchronous response is expected
        } else if (request.action === "translateWordContent" && request.text) {
                chrome?.storage?.sync?.get(['trans_modal'], (items) => {
                        const configKey = TransConfig[items.trans_modal];
                        chrome?.storage?.sync?.get(configKey, (config) => {
                                if (config && request.text) {
                                        TransWordRcord[items.trans_modal](request.text, config, request.promtText, sendResponse)
                                }
                        })
                })
                return true; // Indicates an asynchronous response is expected
        }
        else {
                sendResponse()
        }
});
