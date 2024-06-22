// import CryptoJS from 'crypto-js';

import { PageTranslate } from './PageTranslate'

import { WordTranslate } from './WordTranslate'
import TongYiConnecStream from './Page/TongYiConnecStream'
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

chrome.runtime.onConnect.addListener(function (port) {
        console.assert(port.name === "content-to-background");
        port.onMessage.addListener(function (message) {
                if (message.action === 'translateContent') {
                        chrome?.storage?.sync?.get(['tongyi_apiSecret'], (config) => {
                                if (config) {
                                        TongYiConnecStream(message.text, config, message.promtText, (res) => {
                                                port.postMessage(JSON.parse(res));
                                        })
                                }
                        })
                }
        });

        port.onDisconnect.addListener(function () {
                console.log("Content script disconnected.");
        });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "translateContent" && request.text) {
                chrome?.storage?.sync?.get(['trans_modal'], (items) => {
                        const configKey = TransConfig[items.trans_modal];
                        chrome?.storage?.sync?.get(configKey, (config) => {
                                if (config) {
                                        PageTranslate[items.trans_modal](request.text, config, request.promtText, sendResponse)
                                }
                        })
                })
                return true;
        } else if (request.action === "translateWordContent" && request.text) {
                chrome?.storage?.sync?.get(['trans_modal'], (items) => {
                        const configKey = TransConfig[items.trans_modal];
                        chrome?.storage?.sync?.get(configKey, (config) => {
                                if (config && request.text) {
                                        WordTranslate[items.trans_modal](request.text, config, request.promtText, sendResponse)
                                }
                        })
                })
                return true;
        } else if (request.action === "translateContentWithPipe" && request.text) {
                chrome?.storage?.sync?.get(['tongyi_apiSecret'], (config) => {
                        if (config) {

                                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                                        if (tabs.length > 0) {
                                                const currentTabId = tabs[0].id;
                                                console.log('currentTabId',currentTabId,)
                                                TongYiConnecStream(request.text, config, request.promtText, (res) => {
                                                        sendMessageToContent(currentTabId, {
                                                                action: 'tarnlatedNode',
                                                                text: JSON.parse(res)
                                                        });

                                                })
                                                // 在这里可以使用currentTabId进行后续操作
                                        }
                                });

                        }
                })
        }
        else {
                sendResponse()
        }
});

function sendMessageToContent(tabId, message) {
        chrome.tabs.sendMessage(tabId, message, function (response) {
                if (chrome.runtime.lastError) {
                        console.error("Error sending message:", chrome.runtime.lastError.message);
                } else {
                        console.log("Message sent successfully:", response);
                }
        });
}
