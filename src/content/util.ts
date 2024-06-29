import uniqueId from 'lodash/uniqueId'
// 插入节点
export function insertAfter(newNode: Node, referenceNode: Node) {
    referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling);
}

export async function getLang(text: string) {
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
    return uniqueId('&$')
}

export function istextNode(node: Node) {
    return (node as Element).tagName && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes((node as Element).tagName.toLowerCase())
}
export function isElementNode(node: Element) {
    return node.nodeType === Node.ELEMENT_NODE && !['SCRIPT', 'IMG', 
    
    '#comment', '#cdata-section', 'FOOTER', 'HEADER', 'CODE'].includes(node.nodeName)
}
export function findPNode(node: Node) {
    if (!istextNode(node) && node.parentNode) {
        return findPNode(node.parentNode)
    }
    return node;
}
export function getSelctionTextConent(node: Node) {
    if (istextNode(node)) {
        return node.textContent?.trim() || '';
    }
    if (node.parentNode) {
        const pnode = findPNode(node)
        return pnode.textContent?.trim() || '';
    }
    return ''

}


export function clearChache() {
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