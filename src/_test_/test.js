
const trabslateNode = []
function traverseDOM(node) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
        trabslateNode.push({
            id: node.id,
            text: node.textContent.trim(),
            node: node
        })
    } else if (node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
            traverseDOM(node.childNodes[i]);
        }
    }
}

traverseDOM(document.body);
console.log({ trabslateNode })


function insertAfter(newNode, targetNode) {
    if (targetNode.parentNode) {
        targetNode.parentNode.insertBefore(newNode, targetNode.nextSibling);
    } else {
        console.error('Target node does not have a parent.');
    }
}

const translate = (text) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => data[0][0][0])
        .catch(error => {
            console.error('Error:', error);
        })
}

trabslateNode.forEach(node => {
    const text = node.textContent.trim();
    if (text === '') {
        return;
    }
    const newNode = node.cloneNode(true)
    translate(text).then(translatedText => {
        newNode.textContent += '123';
    });
    insertAfter(newNode, node);

});
