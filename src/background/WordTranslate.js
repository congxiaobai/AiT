import TongYiWordConnect from './Words/TongYiWordConnect';
import SparkConnectWord from './Words/SparkConnectWord';
import { addFavoriteWords } from './FavoriteWords';

export const WordTranslate = {
        kimi: kimiWordTranslateText,
        tongyi: tongyiWordTranslateText,
        spark: sparkWordTranslateText
}
async function kimiWordTranslateText(textArray, kimiConfig, promtText, sendResponse) {
        if (!textArray || textArray.length === 0) {
                return
        }
        try {
                let Record = new KimiTTSRecorder(kimiConfig);
                Record.onEnd = () => {
                        Record.setStatus('close')
                }
                Record.onResult = (res) => {
                        try {
                                let payload = JSON.parse(res)
                                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                                        tabs[0] && chrome.tabs.sendMessage(tabs[0].id, { action: "translateItemCompleted", payload: [payload] }, () => {

                                        });
                                })
                        } catch {

                        }

                }
                Record.sendText(batch, promtText)

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: textArray });
        }
}

async function sparkWordTranslateText(textArray, sparkConfig, promtText, sendResponse) {
        try {
                let WebConnect = new SparkConnectWord(sparkConfig);
                WebConnect.onEnd = (allRes) => {
                        sendResponse(allRes)
                }
                WebConnect.onResult = (res) => {

                }
                WebConnect.onOpen = () => {
                        if (textArray.length > 0) {
                                WebConnect.webSocketSend(textArray, promtText);
                        }
                }
                WebConnect.start()


        } catch (error) {
                console.error('Error parsing the translated text:', error);
                sendResponse()
                return JSON.stringify({ messages: textArray });
        }
}

async function tongyiWordTranslateText(text, tongyiConfig, promtText, sendResponse) {
        try {
                TongYiWordConnect(text, tongyiConfig, promtText, (res) => {

                        sendResponse(res)
                        addFavoriteWords(text, promtText, res)
                        // chrome.tabs.sendMessage(tabs[0].id, { action: "translateItemCompleted", payload: [payload] })
                }, () => { })

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: text });
        }
}
