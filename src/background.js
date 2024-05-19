// import CryptoJS from 'crypto-js';
import { TTSRecorder } from './utils';

chrome.runtime.onInstalled.addListener(() => {
        console.log('Extension installed and running.');
});


let WebConnect = null;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "translate") {
                translateText(request.text, sendResponse)
                // then(translatedText => {
                //         sendResponse({ translatedText: translatedText });
                // }).catch(error => {
                //         sendResponse(request.text);
                // });
                return true; // Indicates an asynchronous response is expected
        }
});

async function translateText(textArray, sendResponse) {
        try {
                if (!WebConnect) {
                        WebConnect = new TTSRecorder()
                        WebConnect.start()
                        // WebConnect.onWillStatusChange = function (oldStatus, status) {
                        //         console.log('onWillStatusChange')
                        //         if (['init', 'endPlay', 'errorTTS'].indexOf(status) > -1) {
                        //                 WebConnect.start()
                        //                 sendResponse({ messages: 'start' })
                        //         }
                        // }

                }

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: textArray });
        }
}
