const batchSize = 4;
const preferredLanguage = navigator.language.split('-')[0];
let detectedLanguage = '';

if (document.readyState !== 'loading') {
        setTimeout(() => detecLang());
} else {
        document.addEventListener('DOMContentLoaded', function () {

                setTimeout(() => detecLang());
        });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'translateRequest') {
                gatherTextNodes(document.body).then(allTextNodes => {
                        chrome.runtime.sendMessage({ action: "translateContent", text: allTextNodes.map(s=>({
                                id:s.id,
                                text:s.text
                        })) }, function (response) {
                                if(response){

                                }
                                sendResponse({ sucess: true });
                        });
                });

        } else {
                sendResponse({ farewell: 'Goodbye' });
        }
        // 发送响应消息
        return true;

});

async function detecLang() {
        const sampleText = document.body.innerText;
        detectedLanguage = await getLang(sampleText);
        if (!detectedLanguage) {
                return;
        }
        chrome.storage.sync.set({ detecLang: detectedLanguage });
}

function watchForMutation() {
        const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                                mutation.addedNodes.forEach((node) => {
                                        if (node.nodeType === Node.ELEMENT_NODE) {
                                                console.log({ addedNodes: node })
                                        }
                                });
                        }
                });
        });
        observer.observe(document.body, {
                childList: true,
                subtree: true,
        });
}

function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
        });
}
/**
 * 递归地收集给定元素内所有非首选语言的文本节点。
 * 
 * @param {Node} element - 要开始收集文本节点的DOM元素。
 * @returns {Promise<Node[]>} 承诺返回一个数组，包含所有非首选语言的文本节点。
 */
async function gatherTextNodes(element) {
        const allTextNodes = [];
        const childNodes = Array.from(element.childNodes);
        for (let node of childNodes) {
                if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim().length > 0) {
                        allTextNodes.push({
                                id: generateUUID(),
                                text: node.textContent.trim(),
                                node: node
                        })
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const childTextNodes = await gatherTextNodes(node);
                        allTextNodes.push(...childTextNodes);
                }
        }
        return allTextNodes;
}



async function getLang(text) {
        const langResult = await chrome.i18n.detectLanguage(text);
        return langResult.languages[0]?.language ?? "";
}



















