// import CryptoJS from 'crypto-js';

import { LinesTranslate } from './LinesTranslate'

import { WordTranslate } from './WordTranslate'
import TongYiConnecStream from './PipeRequest/TongYi'
import { ChromeAction } from '../constant';
import { BackgroundChromRequestType, LinesRequestType, WordRequestType } from './type';
import { generateLinsModalPromot, generateWordModalPromot } from './util';
import { LinesTranslatePipe } from './LinesTranslatePipe';

chrome.runtime.onInstalled.addListener(() => {
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
        if (info.menuItemId === 'myExtensionContextMenu' && tab) {
                tab.id && chrome.tabs.sendMessage(tab.id, { action: 'contextMenuClicked', selectionText: info.selectionText });
        }
});

const TransConfig: {
        [key: string]: string[]
} = {
        kimi: ['kimi_apiKey'],
        spark: ['spark_apiKey', 'spark_apiSecret', 'spark_appId'],
        tongyi: ['tongyi_apiSecret']
}

//使用长连接通信
// chrome.runtime.onConnect.addListener(function (port) {
//         console.assert(port.name === "content-to-background");
//         port.onMessage.addListener(function (message) {
//                 if (message.action === 'translateContent') {
//                         chrome?.storage?.sync?.get(['tongyi_apiSecret'], (config) => {
//                                 if (config) {
//                                         TongYiConnecStream(message.text, config, message.promtText, (res) => {
//                                                 port.postMessage(JSON.parse(res));
//                                         })
//                                 }
//                         })
//                 }
//         });

//         port.onDisconnect.addListener(function () {
//                 console.log("Content script disconnected.");
//         });
// });

chrome.runtime.onMessage.addListener(async (request: BackgroundChromRequestType, sender, sendResponse) => {
    
        if (request.action === ChromeAction.TranslateNodeWithHttp) {

                const nodeArray = (request as LinesRequestType).nodeArray;
                if (!nodeArray || !nodeArray.length) {
                        sendResponse([])
                        return
                }
                const config = await getModalAndConfig()
                if (!config) {
                        sendResponse([])
                        return
                }

                const promptArray = generateLinsModalPromot(nodeArray, (request as LinesRequestType).promptText)
                const requestFn = LinesTranslate[config.transModal];
                await requestFn(promptArray, config.modalConfig, (res) => {
                        console.log(res)
                        sendResponse(res)
                })
               
                return;
        } else if (request.action === ChromeAction.TranslateWord) {
                const wordText = (request as WordRequestType).wordText;
                if (!wordText) {
                        sendResponse([])
                        return
                }
                const config = await getModalAndConfig()
                if (!config) {
                        sendResponse([])
                        return
                }
                const promptArray = generateWordModalPromot(wordText, (request as WordRequestType).selectionText)
                WordTranslate[config.transModal](promptArray, config.modalConfig, sendResponse)

                return true;
        } else if (request.action === ChromeAction.TranslateNodesWithPipe) {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
                if (!tabs[0]?.id) {
                        sendResponse([])
                        console.error('没有找到activeTabId')
                        return
                }
                const nodeArray = (request as LinesRequestType).nodeArray;
                if (!nodeArray || !nodeArray.length) {
                        sendResponse([])
                        return
                }
                const config = await getModalAndConfig()
                if (!config) {
                        sendResponse([])
                        return
                }
                const currentTabId = tabs[0].id;
                const promptArray = generateLinsModalPromot(nodeArray, (request as LinesRequestType).promptText)

                LinesTranslatePipe[config.transModal](promptArray, config.modalConfig, (res) => sendMessageToContent(currentTabId, {
                        action: ChromeAction.NodeTranslated,
                        text: JSON.parse(res)
                }))
                sendResponse()
                return true;

        }
        else {
                sendResponse(['error1'])

                return
        }
});

function sendMessageToContent(tabId: number, message: any) {
        chrome.tabs.sendMessage(tabId, message, function (response) {
                if (chrome.runtime.lastError) {
                        console.error("Error sending message:", chrome.runtime.lastError.message);
                } else {
                        console.log("Message sent successfully:", response);
                }
        });
}

const getModalAndConfig = async () => {
        const transModal = await chrome?.storage?.sync?.get(['trans_modal']) as any;
        if (!transModal.trans_modal) {
                return false
        }
        const configKey = TransConfig[transModal.trans_modal];
        const modalConfig = await chrome?.storage?.sync?.get(configKey)
        if (!modalConfig) {
                return false
        }
        return { modalConfig, transModal: transModal.trans_modal }
}