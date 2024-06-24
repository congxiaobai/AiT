import React, { useState, useEffect } from 'react';
import { NextUIProvider, } from '@nextui-org/react';
import { Textarea } from "@nextui-org/react";
import { ChromeAction } from '../../constant';
import { addFavoriteWords } from './FavoriteWords'
function Popup(props: {
  selectionText: string,
  wordText: string
}) {
  const [content, setContent] = useState('')
  useEffect(() => {

    if (props.wordText) {
      chrome.runtime.sendMessage({
        action: ChromeAction.TranslateWord,
        selectionText: props.selectionText,
        wordText: props.wordText,
      }, (res) => {
        console.log({ translateWordContent: res })
        setContent(res)
        addFavoriteWords(props.wordText, props.selectionText, res)
      }
      )
    }

  }, [props.wordText]);
  return (
    <NextUIProvider>
      <div style={{
        position: 'fixed',
        background: 'black',
        width: 400,
        padding: 10
      }}>
        <div style={{
          display: 'flex',

          marginBottom: 10
        }}>
          <div style={{ fontSize: 16 }}>释义</div>
        </div>

        <Textarea
          isDisabled
          maxRows={20}
          label
          placeholder="解析中，请稍等"
          value={content}
        />

      </div></NextUIProvider>
  );
}

export default Popup;
