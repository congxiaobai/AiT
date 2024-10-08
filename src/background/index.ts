// import CryptoJS from 'crypto-js';

import { LinesTranslate } from './TranslateByHttp/LinesTranslate'

import { WordTranslate } from './TranslateByHttp/WordTranslate'
import TongYiConnecStream from './StreamRequest/TongYi'
import { ChromeAction } from '../constant';
import { BackgroundChromRequestType, LinesRequestType, WordCardType, WordRequestType } from './type';
import { generateCorrectLinePromot, generateLinsModalPromot, generateWordModalPromot, generateWordSourcePromot } from './util';
import { LinesTranslateStream } from './TranslateByStream/LinesTranslate';

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
                tab.id && chrome.tabs.sendMessage(tab.id, { action: ChromeAction.ContextMenuClicked, payload: { wordText: info.selectionText } });
        }
});

const TransConfig: {
        [key: string]: string[]
} = {
        kimi: ['kimi_apiKey'],
        spark: ['spark_apiKey', 'spark_apiSecret', 'spark_appId'],
        tongyi: ['tongyi_apiKey'],
        doubao: ['doubao_apiKey', 'doubao_endpoint']
}

//使用长连接通信
chrome.runtime.onConnect.addListener(function (port) {
        console.assert(port.name === "content-to-background");
        port.onMessage.addListener(function (request) {
                if (request.action === ChromeAction.TranslateNodeWithPort) {
                        const nodeArray = (request as LinesRequestType).nodeArray;
                        getModalAndConfig((config: any) => {
                                if (!config) {
                                        return
                                }
                                const promptArray = generateLinsModalPromot(nodeArray, (request as LinesRequestType).promptText, config)
                                const requestFn = LinesTranslateStream[config.transModal];
                                requestFn(promptArray, config.modalConfig, (res: any) => {
                                        console.log('stream', { res })
                                        port.postMessage(res);
                                })
                        })
                }
        });

        port.onDisconnect.addListener(function () {
                console.log("Content script disconnected.");
        });
});

chrome.runtime.onMessage.addListener((request: BackgroundChromRequestType, sender, sendResponse) => {
        if (request.action === ChromeAction.TranslateNodeWithHttp) {
                const nodeArray = (request as LinesRequestType).nodeArray;
                if (!nodeArray || !nodeArray.length) {
                        sendResponse([])
                        return
                }
                getModalAndConfig((config: any) => {
                        if (!config) {
                                sendResponse('您还没有配置Ai模型，请先配置')
                                return
                        }
                        const promptArray = generateLinsModalPromot(nodeArray, (request as LinesRequestType).promptText, config)
                        const requestFn = LinesTranslate[config.transModal];
                        requestFn(promptArray, config.modalConfig, (res: any) => {
                                console.log(res)
                                sendResponse(res)
                        })
                })
                return true;
        } else if (request.action === ChromeAction.TranslateWord) {
                const wordText = (request as WordRequestType).wordText;
                if (!wordText) {
                        sendResponse([])
                        return
                }
                getModalAndConfig((config: any) => {
                        if (!config) {
                                sendResponse('您还没有配置Ai模型，请先配置')
                                return
                        }
                        const promptArray = generateWordModalPromot(wordText, (request as WordRequestType).selectionText, config)
                        WordTranslate[config.transModal](promptArray, config.modalConfig, (res: any) => {
                                console.log(res)
                                sendResponse(res)
                        })
                })

                return true;

        } else if (request.action === ChromeAction.CorrectLine || request.action === ChromeAction.ForWordSource) {
                const payload = (request as WordCardType).payload;
                if (!payload) {
                        sendResponse([])
                        return
                }
                getModalAndConfig((config: any) => {
                        if (!config) {
                                sendResponse('您还没有配置Ai模型，请先配置')
                                return
                        }
                        const promptArray = payload.line ? generateCorrectLinePromot(payload.line, config) : generateWordSourcePromot(payload.word, config)
                        WordTranslate[config.transModal](promptArray, config.modalConfig, (res: any) => {
                                console.log(res)
                                sendResponse(res)
                        })
                })

                return true;

        }

        else if (request.action === ChromeAction.TranslateNodesWithPipe) {
                const nodeArray = (request as LinesRequestType).nodeArray;
                if (!nodeArray || !nodeArray.length) {
                        sendResponse([])
                        return
                }
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const currentTabId = tabs[0]?.id;
                        if (!currentTabId) {
                                sendResponse(true)
                                console.error('没有找到activeTabId')
                                return
                        }
                        getModalAndConfig((config: any) => {
                                if (!config) {
                                        sendResponse(true)
                                        return
                                }
                                const promptArray = generateLinsModalPromot(nodeArray, (request as LinesRequestType).promptText)
                                LinesTranslatePipe[config.transModal](promptArray, config.modalConfig, (res) => sendMessageToContent(currentTabId, {
                                        action: ChromeAction.NodeTranslated,
                                        text: JSON.parse(res)
                                }))
                                sendResponse(true)
                        })
                })

                return true;
        }
        else {
                sendResponse(['error1'])
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

const getModalAndConfig = (callback: Function) => {
        chrome?.storage?.sync?.get(['trans_modal'], (transModal) => {
                if (!transModal.trans_modal) {
                        callback(false);
                        return
                }
                const configKey = TransConfig[transModal.trans_modal]
                chrome?.storage?.sync?.get([...configKey, 'sourceLang', 'targetLang'], (modalConfig) => {
                        if (!modalConfig) {
                                callback(false);
                                return false
                        }
                        callback({ modalConfig, transModal: transModal.trans_modal })
                })
        }) as any;
}