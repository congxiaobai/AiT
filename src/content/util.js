import uniqueId from 'lodash/uniqueId'
// 插入节点
export function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export async function getLang(text) {
    const langResult = await chrome.i18n.detectLanguage(text);
    return langResult.languages[0]?.language ?? "";
}

export async function detecLang() {
    const sampleText = document.body.innerText;
    const detectedLanguage = await getLang(sampleText);
    if (!detectedLanguage) {
        return;
    }
    chrome.storage.sync.set({ detecLang: detectedLanguage });
}
export function generateUUID() {
    return uniqueId('*&$')
}


export function istextNode(node) {
    return node.tagName && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre'].includes(node.tagName.toLowerCase())
}
export function isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE && !['SCRIPT', '#comment', '#cdata-section', 'FOOTER', 'HEADER'].includes(node.nodeName)
}
export function findPNode(node) {
    if (!istextNode(node) && node.parentNode) {
        return findPNode(node.parentNode)
    }
    return node;
}
export function getSelctionTextConent(node) {
    if (istextNode(node)) {
        return node.textContent.trim();
    }
    if (node.parentNode) {
        const pnode = findPNode(node)
        return pnode.textContent.trim();
    }
    return ''

}

export async function gatherTextNodes(element,allTextNodes) {
    const childNodes = Array.from(element.childNodes);
    for (let node of childNodes) {
            if (istextNode(node)) {
                    // 去掉单一的
                    if (!node.textContent.trim().includes(" ")) {
                            continue;
                    }
                    let id = generateUUID();
                    node._$id = id;
                    node._$translate = 'todo'
                    allTextNodes.push(node)
            } else if (isElementNode(node)) {
                    await gatherTextNodes(node,allTextNodes);
            }
    }
}


function clearChache() {
    chrome.storage.sync.get(null, function (items) {
            if (chrome.runtime.lastError) {
                    console.error('Error getting items: ' + chrome.runtime.lastError);
            } else {
                    console.log('All stored items:', items);
                    // 这里可以遍历items对象来处理每个存储的键值对
                    for (var key in items) {
                            if (key.startsWith('cacheNoes&&') && items.hasOwnProperty(key)) {
                                    const value = items[key]['&chche&time'];
                                    //清除超过1天的缓存
                                    if (value && Date.now() - value > 24 * 60 * 60 * 1000) {
                                            chrome.storage.sync.remove('key')
                                    }
                            }
                    }
            }
    });
}