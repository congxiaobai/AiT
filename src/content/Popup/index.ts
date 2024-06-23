import ReactDOM from 'react-dom/client';
import React from 'react';
import { getSelctionTextConent } from "../util";
import TextContent from './TextContentPopup';

let selectionText = ''
let textPopup: Element | null = null;
let postion = { x: 0, y: 0 }
document.addEventListener('mouseup', function (event) {
    var text = window.getSelection()?.toString()?.trim() || '';
    if (text && event.target) {
        selectionText = getSelctionTextConent(event.target as any);
        postion = {
            x: event.clientX,
            y: event.clientY
        }

    }
});
document.addEventListener('mousedown', function () {
    if (textPopup) {
        textPopup.remove();
        textPopup = null
    }
});

export function createselectionTextPopup(wordText: string) {
    if (!wordText) {
        return
    }

    console.log({ wordText, selectionText });

    textPopup = document.createElement('div');
    textPopup.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation()
    })
    textPopup.id = 'react-popup';
    (textPopup as any).style.position ='absolute';
    (textPopup as any).style.left = postion.x + 'px';
    (textPopup as any).style.top =postion.y + 'px';
    (textPopup as any).style.zIndex =1000
    document.body.appendChild(textPopup);
    const root = ReactDOM.createRoot(textPopup);

    root.render(
        React.createElement(TextContent, { wordText: wordText, selectionText }),
    );

}