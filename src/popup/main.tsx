import { Button } from '@nextui-org/react';
import { sourceLangOptions, aiModalOptions, ChromeAction } from '../constant';
import { Select, SelectItem } from '@nextui-org/react';
import { Textarea } from '@nextui-org/react';
import Logo from '../../public/arrow.svg?react';
import SetIcon from '../../public/setting.svg?react';
import { useEffect, useState } from 'react';
import { throttle } from 'lodash';
import React from 'react';

const App = () => {
  const preferredLanguage = navigator.language.split('-')[0];
  const [sourceLang, setSourceLang] = useState();
  const [aiModal, setAiModal] = useState('');
  const [targetLang, setTargetLang] = useState(preferredLanguage);
  const [text, setText] = useState('');
  const [disabledKeys, setDisabledKeys] = useState<string[]>([]);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    aiModal &&
      chrome?.storage?.sync.set({
        trans_modal: aiModal,
      });
  }, [aiModal]);
  useEffect(() => {
    aiModal &&
      chrome?.storage?.sync.set({
        sourceLang: sourceLang,
        targetLang: targetLang,
      });
  }, [sourceLang, targetLang]);
  chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action === 'loading') {
      console.log({
        loading: request.loading,
      });
      setBtnLoading(request.loading);

    }

    return;
  });
  useEffect(() => {
    chrome?.storage?.sync?.get(['detecLang'], (items) => {
      setSourceLang(items.detecLang);
    });
    let disabledKeys: string[] = [];
    chrome?.storage?.sync?.get(
      [
        'spark_appId',
        'spark_apiSecret',
        'spark_apiKey',
        'trans_modal',
        'kimi_apiKey',
        'tongyi_apiKey',
        'doubao_apiKey',
        'doubao_endpoint',
      ],
      (items) => {
        if (
          !items.spark_appId ||
          !items.spark_apiSecret ||
          !items.spark_apiKey
        ) {
          disabledKeys.push('spark');
        }
        if (!items.kimi_apiKey) {
          disabledKeys.push('kimi');
        }
        if (!items.tongyi_apiKey) {
          disabledKeys.push('tongyi');
        }
        if (!items.doubao_apiKey || !items.doubao_endpoint) {
          disabledKeys.push('doubao');
        }

        if (items.trans_modal && !disabledKeys.includes(items.trans_modal)) {
          setAiModal(items.trans_modal);
        } else {
          setAiModal('');
        }
      },
    );

    setDisabledKeys(disabledKeys);
  }, []);

  const translateRequest = throttle(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        return;
      }
      setBtnLoading(true);
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: ChromeAction.RequestTranslate,
          payload: {
            sourceLang,
            promptText: text,
            targetLang,
          },
        },
        () => {

        },
      );
    });
  }, 200);
  const  extensionsid=()=> {
    if (!!chrome.runtime) { // 方法一
      return chrome.runtime?.id || '-1';
    } else if (chrome.i18n) { // 方法二
      return chrome.i18n.getMessage("@@extension_id") || '-1';
    }
    return '-1';
  }
  return (
    <div className=" flex flex-col gap-4  justify-center">
      <div className="flex gap-2 justify-center items-center">
        <Select
          items={sourceLangOptions}
          size="sm"
          label="源语言"
          selectedKeys={[sourceLang]}
          onChange={(e) => setSourceLang(e.target.value)}
        >
          {(animal) => (
            <SelectItem key={animal.value}>{animal.label}</SelectItem>
          )}
        </Select>
        <Logo className="w-6 h-12"></Logo>
        <Select
          items={sourceLangOptions}
          size="sm"
          label="目标语言"
          selectedKeys={[targetLang]}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          {(animal) => (
            <SelectItem key={animal.value}>{animal.label}</SelectItem>
          )}
        </Select>
      </div>
      <Select
        items={aiModalOptions}
        size="sm"
        label="翻译服务"
        disabledKeys={disabledKeys}
        selectedKeys={[aiModal]}
        onChange={(e) => setAiModal(e.target.value)}
      >
        {(animal) => <SelectItem key={animal.value}>{animal.label}</SelectItem>}
      </Select>
      <Textarea
        label="补充描述"
        value={text}
        onChange={(e) => e.target.value.length < 101 && setText(e.target.value)}
        placeholder="输入一些其他信息，便于更精确的术语翻译，比如'这是一篇经济学的论文'。限制100个字"
      />
      <Button
        isLoading={btnLoading}
        isDisabled={
          !(sourceLang && aiModal && targetLang && targetLang !== sourceLang)
        }
        radius="full"
        onClick={translateRequest}
        className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
      >
        翻译
      </Button>
      <div className="flex gap-2 flex-row-reverse">
        <Button
          isIconOnly
          className="bg-gray-300"
          size="sm"
          onClick={() => {
            chrome.runtime.openOptionsPage(function () {
              console.log('Options page opened.');
            });
          }}
        >
          <SetIcon className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          color="primary"
          onClick={() => {
            chrome.tabs.create({
              url: 'chrome-extension://'+extensionsid()+'/wordsheet.html',
            });
          }}
        >
          单词本
        </Button>
      </div>
    </div>
  );
};

export default App;
