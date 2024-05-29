// import CryptoJS from 'crypto-js';
import { TTSRecorder } from './SparkConnect';

chrome.runtime.onInstalled.addListener(() => {
        console.log('Extension installed and running.');
});


let WebConnect = null;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "translateContent") {
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
                }
                if (WebConnect.status === 'ready') {
                        WebConnect.textArray = textArray;
                        WebConnect.onResult = (res) => {
                                if (res.length) {
                                        sendResponse(res)
                                } else {
                                        sendResponse([])
                                }
                        }

                        WebConnect.start()

                }

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: textArray });
        }
}
