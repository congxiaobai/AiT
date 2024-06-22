export function getFavoriteWords() {
    chrome.storage.local.get(null, function (items) {
        if (chrome.runtime.lastError) {
            console.error('Error getting items: ' + chrome.runtime.lastError);
        } else {
            console.log('All stored items:', items);
        }
    });
}

export function addFavoriteWords(word, line, translated) {
    // 获取特定键的值
    chrome.storage.local.get([word], function (result) {
        if (!result) {
            chrome.storage.local.set(word, {
                word,
                lines: [line],
                translated: [translated],
                count: 1,
            })
        } else {
            result.lines.push(line);
            result.translated.push(translated);
            result.lines.count++;
            chrome.storage.local.set(word, result)
        }
    });
}

export function deleteFavoriteWords(word) {
    chrome.storage.local.remove(word)
}
