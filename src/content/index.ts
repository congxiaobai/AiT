
import { createselectionTextPopup } from './Popup/index'
import PageState from './PageState';
import './content.css'
let PageStateInstance: PageState | null = null;

import { detecLang, clearChache, insertAfter } from './util'
import { ChromeAction } from '../constant';
import { ChormePaylodtype, MenuContentType, NodeTranslatedNodeType, RequestTranslatType } from './type';

if (document.readyState !== 'loading') {
        setTimeout(() => detecLang());
} else {
        document.addEventListener('DOMContentLoaded', function () {
                setTimeout(() => detecLang());
                clearChache();
        });
}

// 收集所有节点，并观察
chrome.runtime.onMessage.addListener((message: {
        action: string,
        payload: ChormePaylodtype
}, sender, sendResponse) => {
        sendResponse({ sucess: true });
        // 处理已翻译的节点
        if (message.action === ChromeAction.NodeTranslated) {
                console.error(message.payload);
                const node = message.payload as NodeTranslatedNodeType
                if (!node.id) {
                        return
                }
                PageStateInstance && PageStateInstance.addtranslateNode(node.id, node.text)
        }
        //处理popup请求翻译
        else if (message.action === ChromeAction.RequestTranslate) {
                let promptText = (message.payload as RequestTranslatType).promptText;
                if (PageStateInstance) {
                        PageStateInstance.clearPreData(promptText)
                } else {
                        PageStateInstance = new PageState(promptText);
                        PageStateInstance.gatherTextNodes(document.body);
                        PageStateInstance.observerNode();
                        PageStateInstance.watchForMutation();
                };
        }
        // 处理右键菜单
        else if (message.action === ChromeAction.ContextMenuClicked) {
                var text = (message.payload as MenuContentType).wordText
                createselectionTextPopup(text)
        }

        return true;
});




















