const preferredLanguage = navigator.language.split('-')[0];
import debounce from 'lodash/debounce'

let detectedLanguage = '';
const allTextNodes = [];
const loadingNode = [];
const inViewNodes = [];
import { detecLang, generateUUID, istextNode, isElementNode, insertAfter } from './util'

if (document.readyState !== 'loading') {
        setTimeout(() => detecLang());
} else {
        document.addEventListener('DOMContentLoaded', function () {
                setTimeout(() => detecLang());
        });
}
const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
                if (entry.isIntersecting) {
                        let targetNode = entry.target;
                        if (!inViewNodes.find(s => s._$id === targetNode._$id) && targetNode._$translate !== 'done') {
                                inViewNodes.push(targetNode);
                                refreshTrans();
                        }
                }
        });
}, { threshold: 0.8 });

//只看在视图内的节点
const refreshTrans = debounce(() => {
        let peddingNode = inViewNodes.filter(s => s._$translate !== 'done').sort((a, b) => a._$sortIndex - b._$sortIndex);
        if (peddingNode.length === 0) {
                return
        }
        console.log('请求翻译的节点', peddingNode.map(s => s.textContent))
        chrome.runtime.sendMessage({
                action: "translateContent", text: peddingNode.map(node => {
                        node._$translate = 'doing';
                        const newNode = node.cloneNode(true);
                        newNode.textContent = '';
                        newNode.classList.add('translate_loading')
                        newNode.style.opacity = 0.6;
                        insertAfter(newNode, node)
                        loadingNode.push(newNode)
                        return {
                                id: node._$id,
                                text: node.textContent,
                        }
                })
        }, () => {
                console.log('请求成功')
        })
}, 200)

// 收集所有节点，并观察
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'translateRequest') {
                gatherTextNodes(document.body).then(() => {
                        console.log('收集到的节点', allTextNodes.map(s => s.textContent))
                        allTextNodes.forEach((s, index) => {
                                observer.observe(s)
                                s._$sortIndex = index
                        })
                })
        }
        if (message.action === 'translateItemCompleted') {
                if (!message.payload) {
                        sendResponse({ sucess: true });return true;
                }
                const { id, text } = message.payload;
                const node = allTextNodes.find(n => n._$id === id);
                if (node) {
                        node._$translate = 'done';
                        const newNode = node.cloneNode(true);
                        newNode.textContent = text;
                        newNode.style.opacity = 0.6;
                        insertAfter(newNode, node);
                        observer.unobserve(node);
                }
                const inNode = loadingNode.find(n => n._$id === id);
                if (inNode) {
                        inNode.remove()
                }
        }
        sendResponse({ sucess: true });
        return true;
});

async function gatherTextNodes(element) {
        const childNodes = Array.from(element.childNodes);
        for (let node of childNodes) {
                if (istextNode(node)) {
                        // 去掉单一的
                        if (!node.textContent.trim().includes(" ")) {
                                continue;
                        }
                        let id = generateUUID();
                        node._$id = id;
                        allTextNodes.push(node)
                } else if (isElementNode(node)) {
                        await gatherTextNodes(node);
                }
        }
}
























