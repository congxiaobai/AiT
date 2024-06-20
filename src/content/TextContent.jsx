import React, { useState, useEffect } from 'react';
import { NextUIProvider, Button } from '@nextui-org/react';
import { HeartIcon } from './icon';
import { Textarea } from "@nextui-org/react";
function Popup(props) {
  const [content, setContent] = useState('')
  useEffect(() => {

    if (props.text) {
      props.seselectionText

      chrome.runtime.sendMessage({
        action: "translateWordContent",
        promtText: props.seselectionText,
        text: props.text,
      }, (res) => {
        console.log({ translateWordContent: res })
        setContent(res)
      }
      )
    }

  }, [props.text]);
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
 
          marginBottom:10
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
