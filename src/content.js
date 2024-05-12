const batchSize = 4;
const preferredLanguage = navigator.language.split('-')[0];
let detectedLanguage = '';

if (document.readyState !== 'loading') {
        setTimeout(() => startTranslation(), 500);  // specify batch size
} else {
        document.addEventListener('DOMContentLoaded', function () {
                // dectLang()
                // chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                //         console.log({ contentMessage: request })
                //         if (request.action === "translateRequest") {
                //                 //translateDocument(batchSize);
                //                 sendResponse({ text: '翻译请求成功' })
                //                 chrome.runtime.sendMessage({ action: "translate", text: '获取了文本' }, function (response) {
                //                         console.log('发送文本成功')
                //                 });
                //                 return true;
                //         }
                // });

                setTimeout(() => startTranslation(), 500);  // specify batch size
        });
}


async function startTranslation() {
        const sampleText = document.body.innerText;
        detectedLanguage = await getLang(sampleText);
        if (!detectedLanguage) {
                return;
        }
        chrome.runtime.sendMessage({ action: "detectedLanguage", detectedLanguage: detectedLanguage }, function (response) {
                console.log('transform success')
        });
}

function watchForMutation() {
        const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                                mutation.addedNodes.forEach((node) => {
                                        if (node.nodeType === Node.ELEMENT_NODE) {
                                                gatherTextNodes(node).then(changedTextNodes => {
                                                        console.log("Making " + changedTextNodes.length / batchSize + " total requests");
                                                        translateInBatches(changedTextNodes, batchSize);
                                                });
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

function translateDocument(batchSize) {
        console.log("Harvesting text");
        gatherTextNodes(document.body).then(allTextNodes => {
                console.log("Making " + allTextNodes.length / batchSize + " total requests");
                translateInBatches(allTextNodes, batchSize);
        });
        watchForMutation();
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
                        const detectedLanguage = await getLang(node.textContent);
                        if (detectedLanguage !== preferredLanguage) {
                                allTextNodes.push(node);
                        }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const childTextNodes = await gatherTextNodes(node);
                        allTextNodes.push(...childTextNodes);
                }
        }
        return allTextNodes;
}

function translateInBatches(textNodes, batchSize) {
        for (let i = 0; i < textNodes.length; i += batchSize) {
                const batch = textNodes.slice(i, i + batchSize);
                const textArray = batch.map(node => node.textContent?.trim());

                chrome.runtime.sendMessage({ action: "translate", text: textArray }, function (response) {
                        if (response.translatedText && Array.isArray(response.translatedText) && response.translatedText.length === batch.length) {
                                batch.forEach((node, index) => {
                                        if (document.contains(node.parentElement)) {
                                                node.textContent = response.translatedText[index];
                                        }
                                });
                        }
                });
        }
}


async function getLang(text) {
        const langResult = await chrome.i18n.detectLanguage(text);
        return langResult.languages[0]?.language ?? "";
}


// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//         if (request.action === 'getDetectedLanguage') {
//                 sendResponse({ detectedLanguage: detectedLanguage });
//         } else if (request.action === 'startTranslation') {
//                 const alwaysTranslate = request.alwaysTranslate;
//                 if (alwaysTranslate) {
//                         chrome.storage.sync.get('alwaysTranslateLanguages', function (data) {
//                                 const alwaysTranslateLanguages = data.alwaysTranslateLanguages || [];
//                                 if (!alwaysTranslateLanguages.includes(detectedLanguage)) {
//                                         alwaysTranslateLanguages.push(detectedLanguage);
//                                         chrome.storage.sync.set({ alwaysTranslateLanguages: alwaysTranslateLanguages });
//                                 }
//                         });
//                 }
//                 translateDocument(batchSize);
//         }
// });




















