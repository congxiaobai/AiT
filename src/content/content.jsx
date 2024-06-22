import debounce from 'lodash/debounce'
import ReactDOM from 'react-dom/client';
import React from 'react';
import TextContent from './TextContent';
import './content.css'
let allTextNodes = [];
let loadingNode = [];
let inViewNodes = [];
let appendsNodes = [];
let promtText = ''
let textPopup = null;
let seselectionText = '';
let postion = { x: 0, y: 0 }
import { detecLang, generateUUID, clearChache, gatherTextNodes, insertAfter, getSelctionTextConent } from './util'

if (document.readyState !== 'loading') {
        setTimeout(() => detecLang());
} else {
        document.addEventListener('DOMContentLoaded', function () {
                setTimeout(() => detecLang());
                clearChache();
        });
}

document.addEventListener('mouseup', function (event) {
        var text = window.getSelection().toString()?.trim();
        if (text) {
                seselectionText = getSelctionTextConent(event.target);
                postion = {
                        x: event.clientX,
                        y: event.clientY
                }

        }
});
document.addEventListener('mousedown', function (event) {
        if (textPopup) {
                textPopup.remove();
                textPopup = null
        }
});
const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
                if (entry.isIntersecting) {
                        let targetNode = entry.target;
                        if (!inViewNodes.find(s => s._$id === targetNode._$id) && targetNode._$translate === 'todo') {
                                inViewNodes.push(targetNode);
                                refreshTrans();
                        }
                }
        });
}, { threshold: 0.8 });

//只看在视图内的节点
const refreshTrans = debounce(() => {
        let peddingNode = inViewNodes.filter(s => s._$translate === 'todo').sort((a, b) => a._$sortIndex - b._$sortIndex);
        if (peddingNode.length === 0) {
                return
        }
        console.log('请求翻译的节点', peddingNode.map(s => s.textContent))
        translateInBatches(peddingNode, 6)
}, 200)

function clearPreData() {
        inViewNodes = [];
        loadingNode.forEach(s => s.remove());
        appendsNodes.forEach(s => s.remove());
        loadingNode = [];
        appendsNodes = [];
        allTextNodes.forEach((node, index) => {
                let id = generateUUID();
                node._$id = id;
                node._$sortIndex = index
                node._$translate = 'todo';
                observer.observe(node);
        })

        loadingNode = [];
}

// 收集所有节点，并观察
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        sendResponse({ sucess: true });
        if (message.action === 'translateRequest') {
                promtText = message.payload.promtText;
                if (allTextNodes.length > 0) {
                        clearPreData();
                } else {
                        gatherTextNodes(document.body, allTextNodes).then(() => {

                                allTextNodes.forEach((s, index) => {
                                        observer.observe(s)
                                        s._$sortIndex = index
                                })
                        })
                }

        }
        if ('contextMenuClicked' === message.action) {
                var text = message.selectionText
                if (text) {
                        console.log({ text, seselectionText });

                        textPopup = document.createElement('div');
                        textPopup.addEventListener('mousedown', (e) => {
                                e.stopPropagation();
                                e.stopImmediatePropagation()
                        })
                        textPopup.id = 'react-popup';
                        textPopup.style.position = 'absolute';
                        textPopup.style.left = postion.x + 'px';
                        textPopup.style.top = postion.y + 'px';

                        textPopup.style.zIndex = 1000;
                        document.body.appendChild(textPopup);
                        const root = ReactDOM.createRoot(textPopup);

                        root.render(
                                React.createElement(TextContent, { text: text, seselectionText }),
                        );
                }
        }

        return true;
});




async function translateInBatches(peddingNode, batchSize) {
        var currentURL = 'cacheNoes&&' + window.location.href;
        let unTransNode = []
        chrome?.storage?.sync?.get([currentURL], (items) => {
                const allCacheTextNodes = items[currentURL] || {};
                if (allCacheTextNodes) {
                        peddingNode.forEach(node => {
                                const cacheText = allCacheTextNodes[node.textContent]
                                if (cacheText) {
                                        addtranslateNode(node._$id, cacheText)
                                } else {
                                        unTransNode.push(node)
                                }
                        })
                } else {
                        unTransNode = peddingNode
                }
                for (let i = 0; i < unTransNode.length; i += batchSize) {
                        const batch = unTransNode.slice(i, i + batchSize);
                        console.log('请求翻译的节点', batch.map(s => s._$id).join(';'));
                        chrome.runtime.sendMessage({
                                action: "loading", loading: true
                        })
                        chrome.runtime.sendMessage({
                                action: "translateContent",
                                promtText: promtText,
                                text: batch.map(node => {
                                        node._$translate = 'doing';
                                        const newNode = document.createElement('p')
                                        newNode._$id = node._$id
                                        newNode.classList.add('translate_loading')
                                        newNode.style.opacity = 0.6;
                                        insertAfter(newNode, node)
                                        loadingNode.push(newNode)
                                        return {
                                                id: node._$id,
                                                text: node.textContent,
                                        }
                                })
                        }, (res) => {
                                console.log('翻译后的节点', res.map(s => s.id).join(';'));
                                chrome.runtime.sendMessage({
                                        action: "loading", loading: false
                                })
                                if (Array.isArray(res)) {
                                        const newCacheNodes = {}
                                        res.forEach(item => {
                                                const { id, text } = item;
                                                addtranslateNode(id, text)
                                                const node = allTextNodes.find(n => n._$id === id);
                                                if (node) {
                                                        newCacheNodes[node.textContent] = text
                                                }
                                        })
                                        chrome?.storage?.sync?.get([currentURL], (items) => {
                                                const newValue = {
                                                        ...(items[currentURL] || {}),
                                                        ...newCacheNodes,
                                                        '&chche&time': Date.now()
                                                }
                                                chrome?.storage?.sync?.set(currentURL, newValue)
                                        })
                                }
                        })
                }
        });

}
function addtranslateNode(id, text) {
        const node = allTextNodes.find(n => n._$id === id);
        if (node) {
                node._$translate = 'done';
                const newNode = node.cloneNode(true);
                newNode.textContent = text;
                newNode.style.opacity = 0.6;
                insertAfter(newNode, node);
                appendsNodes.push(newNode)
                console.log('收到翻译文本', id)

                observer.unobserve(node);
        }
        const inNode = loadingNode.find(n => n._$id === id);
        if (inNode) {
                inNode.remove()
        }
}



















