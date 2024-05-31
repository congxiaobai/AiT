import './App.css'
let nodeCount=0;
function generateUUID() {
    nodeCount++;
    return '_*_&' + nodeCount;
}
function isntextNode (node){
    return node.tagName && ['p','h1','h2','h3','h4','h5','h6','pre'].includes(node.tagName.toLowerCase())
}
async function gatherTextNodes(element) {
    const allTextNodes = [];
    const childNodes = Array.from(element.childNodes);
    for (let node of childNodes) {
            if (isntextNode(node)) {
                    // 去掉单一的
                    if (!node.textContent.trim().includes(" ")) {
                            continue;
                    }
                    console.log({node})
                    allTextNodes.push({
                            id: generateUUID(),
                            text: node.innerHtml,
                            node: node
                    })
            } else if (node.nodeType === Node.ELEMENT_NODE && !['SCRIPT', '#comment', '#cdata-section','FOOTER','HEADER'].includes(node.nodeName)) {
                    const childTextNodes = await gatherTextNodes(node);
                    allTextNodes.push(...childTextNodes);
            }
    }
    return allTextNodes;
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
// 自定义insertAfter函数，因为原生JavaScript中没有这个方法
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
const audioCtrlBtn = document.querySelector('.audio-ctrl-btn');
if (audioCtrlBtn) {
    audioCtrlBtn.addEventListener('click', function () {
        gatherTextNodes(document.body).then(allTextNodes=>{
           
            allTextNodes.forEach(node=>{
                const newNode = node.node.cloneNode(true);
            
                insertAfter(newNode, node.node);

            })
        })
    });
}