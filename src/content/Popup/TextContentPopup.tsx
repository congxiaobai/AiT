import React, { useState, useEffect } from 'react';

import { Textarea } from '@nextui-org/react';
import { ChromeAction } from '../../constant';
import { addFavoriteWords } from './FavoriteWords';
import '../content.css';
function Popup(props: { selectionText: string; wordText: string }) {
  const [content, setContent] = useState('');
  useEffect(() => {
    if (props.wordText) {
      chrome.runtime.sendMessage(
        {
          action: ChromeAction.TranslateWord,
          selectionText: props.selectionText,
          wordText: props.wordText,
        },
        (res) => {
          console.log({ translateWordContent: res });
          setContent(res);
          addFavoriteWords(props.wordText, props.selectionText, res);
        },
      );
    }
  }, [props.wordText]);
  return (
    <div className="ait_popup_tainer">
      <div style={{ fontSize: 16 }}>释义</div>
      <div>
        {content
          ? content.split('\n').map((s) => {
              return <div style={{ fontSize: 12, marginBottom: 5 }}>{s}</div>;
            })
          : '解析中，请稍等...'}
      </div>
    </div>
  );
}

export default Popup;
