import { debounce, throttle } from "lodash";
import { CacheNode, CustomNode } from "./type";
import { generateUUID, insertAfter, isElementNode, istextNode } from "./util";
import { ChromeAction } from "../constant";

export default class PageState {
    //页面所有的节点
    private allTextNodes: CustomNode[] = [];
    // 所有的loading节点
    private loadingNode: CustomNode[] = [];
    //所有的loading节点
    private inViewNodes: CustomNode[] = [];
    private allCacheTextNodes: CacheNode = {};
    private appendsNodes: Node[] = [];
    private observer: IntersectionObserver;

    private batchSize = 10;
    private promptText: string;
    private currentURLKey: string;
    private port = chrome.runtime.connect({ name: "content-to-background" });

    constructor(promptText: string) {
        this.currentURLKey = 'cacheNoes&&' + window.location.href;
        chrome?.storage?.sync?.get([this.currentURLKey], (items) => {
            this.allCacheTextNodes = items[this.currentURLKey] || {};
            console.log({ '获取缓存': this.allCacheTextNodes })
        })
        this.promptText = promptText;
        this.observer = new IntersectionObserver((entries: any) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                if (entry.isIntersecting) {
                    let targetNode = (entry.target as unknown) as CustomNode;
                    if (!this.inViewNodes.find(s => s._$id === targetNode._$id) && targetNode._$translate === 'todo') {
                        this.inViewNodes.push(targetNode);
                        this.refreshTrans();
                    }
                }
            });
        }, { threshold: 0.8 });
    }
    // 根据滚动刷新
    refreshTrans = debounce(() => {
        let peddingNode = this.inViewNodes.filter(s => s._$translate === 'todo')
            .sort((a, b) => a._$sortIndex - b._$sortIndex);
        if (peddingNode.length === 0) {
            return
        }
        this.translateInBatches(peddingNode)
    }, 200)

    //收集文档所有的节点
    gatherTextNodes = (element: Node) => {
        const childNodes = Array.from(element.childNodes);
        for (let node of childNodes) {
            if (istextNode(node)) {
                // 去掉单一的单词
                if (!node.textContent || !node.textContent.trim().includes(" ")) {
                    continue;
                }
                let id = generateUUID();
                (node as any)._$id = id;
                (node as any)._$translate = 'todo';


                this.allTextNodes.push(node as any)
            } else if (isElementNode(node as Element)) {
                this.gatherTextNodes(node);
            }
        }
    }
    //节点纳入监控
    observerNode = () => {
        this.allTextNodes.forEach((s, index) => {
            this.observer.observe(s as any)
            s._$sortIndex = index
        })
    }
    //监听增长的node
    watchForMutation = () => {
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (isElementNode(node as Element)) {
                            this.gatherTextNodes(node)
                        }
                    });
                    this.observerNode()
                }
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
    //批量翻译
    translateInBatches = async (peddingNode: CustomNode[]) => {
        let unTransNode: CustomNode[] = this.handlerCacheNodes(peddingNode)
        if (unTransNode.length === 0) {
            this.checkExistDoing()
            return
        }
        const toTranslateNode = unTransNode.map(node => {
            node._$translate = 'doing';
            const newNode = document.createElement('p');
            (newNode as any)._$id = node._$id;
            newNode.classList.add('translate_loading');
            (newNode as any).style.opacity = 0.6;
            insertAfter(newNode, node);
            this.loadingNode.push(newNode as any);
            return {
                id: node._$id,
                text: node.textContent || '',
            }
        })
        this.changeModal(toTranslateNode)
        //this.translateWithHttp(toTranslateNode)
    }
    // 使用流式HTTP请求
    translateWithPipe = (toTranslateNode: { id: string, text: string }[]) => {
        chrome.runtime.sendMessage({
            action: ChromeAction.TranslateNodesWithPipe,
            promptText: this.promptText,
            nodeArray: toTranslateNode
        }, () => {
        })
    }


    // 使用一部分缓存节点
    handlerCacheNodes = (peddingNode: CustomNode[]) => {
        let unTransNode: CustomNode[] = [];
        console.log({ '待翻译节点': peddingNode.map(s => s._$id) })

        peddingNode.forEach(node => {

            if (!node.textContent) {
                return;
            }
            const cacheText = this.allCacheTextNodes[node.textContent]
            if (cacheText) {
                this.addtranslateNode(node._$id, cacheText)
                console.log({ '使用缓存': node._$id })
            } else {
                unTransNode.push(node)
            }
        })
        return unTransNode;
    }
    // 清除上次翻译数据
    clearPreData = (promptText: string) => {
        this.inViewNodes = [];
        this.loadingNode.forEach(s => (s as any).remove());
        this.appendsNodes.forEach(s => (s as any).remove());
        this.loadingNode = [];
        this.appendsNodes = [];
        this.promptText = promptText;
        this.allTextNodes.forEach((node, index) => {
            let id = generateUUID();
            (node as any)._$id = id;
            (node as any)._$sortIndex = index;
            (node as any)._$translate = 'todo';
            this.observer.observe(node as unknown as Element);
        })

        this.loadingNode = [];
    }
    // 添加翻译后节点
    addtranslateNode = (id: string, text: string) => {
        const node = this.allTextNodes.find(n => n._$id === id);
        if (node && node._$translate !== 'done') {
            node._$translate = 'done';
            const newNode = node.cloneNode(true);
            newNode.textContent = text;
            (newNode as any).style.opacity = 0.6;
            insertAfter(newNode, node);
            this.appendsNodes.push(newNode)
            console.log('收到翻译文本', id)
            this.observer.unobserve(node as unknown as Element);
        }
        const inNode = this.loadingNode.find(n => n._$id === id);
        inNode && (inNode as any).remove()
    }
    checkExistDoing = () => {
        if (!this.allTextNodes.find(n => n._$translate === 'doing')) {
            chrome.runtime.sendMessage({
                action: "loading", loading: false
            })
        }
    }

    handlerRetry = () => {
        const errNodes = this.loadingNode.filter(n => n._$translate === 'error');
        if (errNodes.length > 0) {
            const toTranslateNode = errNodes.map(node => {
                node._$translate = 'doing';
                const errorPendNode = this.appendsNodes.find(s => s._$id === node._$id)
                if (errorPendNode) {
                    errorPendNode.remove();
                }
                const newNode = document.createElement('p');
                (newNode as any)._$id = node._$id;
                newNode.classList.add('translate_loading');
                (newNode as any).style.opacity = 0.6;
                insertAfter(newNode, node);
                this.loadingNode.push(newNode as any);
                return {
                    id: node._$id,
                    text: node.textContent || '',
                }
            })
            this.changeModal(toTranslateNode)

        }
    }

    changeModal = (toTranslateNode: any) => {

        this.translateWithHttp(toTranslateNode)
        // // chrome?.storage?.sync?.get(['trans_modal'], (transModal) => {
        // //     if ([ 'tongyi','spark'].includes(transModal.trans_modal)) {
        // //         this.translateWithStream(toTranslateNode)
        // //     } else {

        // //     }
        // // }
        // )
    }
    handerErrors = (unTransNode: { id: string, text: string }[], err: string) => {
        unTransNode.forEach(node => {
            const inNode: any = this.loadingNode.find(n => n._$id === node.id);
            const originNode = this.allTextNodes.find(n => n._$id === node.id);
            if (originNode) {
                originNode._$translate = 'error';
            }
            if (inNode) {
                inNode.classList.remove('translate_loading');
                inNode.classList.add('translate_error');
                inNode.textContent = `异常，可能是配置问题或者网络问题，点击重试`;
                inNode.addEventListener('click', throttle(() => {
                    this.handlerRetry()
                }), 100)
            }
        })
    }

    // 使用HTTP进行翻译
    translateWithHttp = (unTransNode: { id: string, text: string }[]) => {
        for (let i = 0; i < unTransNode.length; i += this.batchSize) {
            const batch = unTransNode.slice(i, i + this.batchSize);
            console.log('请求翻译的节点', batch.map(s => s.id).join(';'));
            chrome.runtime.sendMessage({
                action: "loading", loading: true
            })
            chrome.runtime.sendMessage({
                action: ChromeAction.TranslateNodeWithHttp,
                promptText: this.promptText,
                nodeArray: batch.map(s => s.text.replaceAll(/[\n\r]/g, '').replaceAll("[", '【').replaceAll("]", "】")),
            }, (responese) => {
                console.log({ responese });
                if (!responese || responese === 'error') {
                    this.handerErrors(unTransNode, responese)
                    this.checkExistDoing()
                    return
                }
                let res = responese;
                if (!Array.isArray(responese)) {
                    res = [responese]
                }
                batch.forEach((item: { id: string, text: string }, index: number) => {
                    const { id } = item;
                    const text = res[index] || 'error'
                    if (text === 'error') {
                        this.handerErrors([batch[index]], text)
                    } else {
                        this.addtranslateNode(id, text)
                        const node = this.allTextNodes.find(n => n._$id === id);
                        if (node && node.textContent) {
                            this.allCacheTextNodes[node.textContent] = text
                        }
                    }

                })
                this.checkExistDoing()
                chrome?.storage?.sync?.set({
                    [this.currentURLKey]: this.allCacheTextNodes
                })
            })
        }
    }
    //使用长连接翻译
    translateWithStream = (unTransNode: { id: string, text: string }[]) => {
        this.port.postMessage(
            {
                action: ChromeAction.TranslateNodeWithPort,
                promptText: this.promptText,
                nodeArray: unTransNode
            }
        );
        this.port.onMessage.addListener((message: { id: string, text: string }) => {
            if (!message.id) {
                this.checkExistDoing()
                return
            }
            const { id, text } = message;
            this.addtranslateNode(id, text)
            const node = this.allTextNodes.find(n => n._$id === id);
            if (node && node.textContent) {
                this.allCacheTextNodes[node.textContent] = text
            }
            this.checkExistDoing()
            chrome?.storage?.sync?.set({
                [this.currentURLKey]: this.allCacheTextNodes
            })
        });
    }
}

