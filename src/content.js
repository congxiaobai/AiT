const batchSize = 4;
const preferredLanguage = navigator.language.split('-')[0];
let detectedLanguage = '';
const nodeCount = 0;
if (document.readyState !== 'loading') {
        setTimeout(() => detecLang());
} else {
        document.addEventListener('DOMContentLoaded', function () {

                setTimeout(() => detecLang());
        });
}

function findParentNode(node) {
        if (node.appendChild && node.nodeType === Node.ELEMENT_NODE) {
                return node
        }
        if (!node.parentNode) {
                return null
        }
        return findParentNode(node.parentNode)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'translateRequest') {
                gatherTextNodes(document.body).then(allTextNodes => {
                        chrome.runtime.sendMessage({
                                action: "translateContent", text: allTextNodes.map(s => ({
                                        id: s.id,
                                        text: s.text
                                }))
                        }, function (response) {
                                if (response && Array.isArray(response)) {
                                        response.forEach(({ id, text }) => {
                                                const node = allTextNodes.find(n => n.id === id);

                                                if (node && node.node) {
                                                        const newNode = node.node.cloneNode(true);
                                                        newNode.textContent = text;
                                                        if (node.node.append) {
                                                                node.node.append(newNode)
                                                        }
                                                        let parentNode = findParentNode(node.node);
                                                        if (parentNode) {
                                                                parentNode.appendChild(newNode)
                                                        }

                                                }
                                        });

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
        nodeCount++;
        return '_*_&' + nodeCount;
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
                        // 去掉单一的词语
                        if (!node.textContent.trim().includes(" ") && node.childNodes.length == 0) {
                                continue;
                        }
                        allTextNodes.push({
                                id: generateUUID(),
                                text: node.textContent.trim(),
                                node: node
                        })
                } else if (node.nodeType === Node.ELEMENT_NODE && !['SCRIPT', '#comment', '#cdata-section'].includes(node.nodeName)) {
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



















