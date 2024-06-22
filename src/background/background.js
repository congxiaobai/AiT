// import CryptoJS from 'crypto-js';

import { PageTranslate } from './PageTranslate'

import { WordTranslate } from './WordTranslate'
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
        }
        else {
                sendResponse()
        }
});
