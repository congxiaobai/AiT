import { Button } from '@nextui-org/react';

import { Select, SelectItem } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";

import Logo from '../public/arrow.svg?react'
import { useEffect, useRef, useState } from 'react';
const source = [
  { label: "英文", value: "en" },
  { label: "中文", value: "zh" },
  { label: "日文", value: "ja" },
  { label: "法文", value: "fr" },
  { label: "德文", value: "de" }
]

async function getLang(text) {
  const langResult = await chrome.i18n.detectLanguage(text);
  return langResult.languages[0]?.language ?? "";
}

const App = () => {
  const preferredLanguage = navigator.language.split('-')[0];
  const [sourceLang, setSourceLang] = useState()
  const [targetLang, setTargetLang] = useState(preferredLanguage);

  useEffect(() => {
    // dectLang()
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      console.log({ appMessage: request })
      if (request.action === "detectedLanguage") {
        setSourceLang(request.detectedLanguage)
        sendResponse();
        return true; // Indicates an asynchronous response is expected
      }
      if (request.action === "translate") {
        sendResponse();

        console.log({
          request
        })
        return true;
      }
    });
  }, []);
  const translateRequest = () => {
    chrome.runtime.sendMessage({ action: "translateRequest" }, function (response) {
      console.log(response)
    });
  }
  return (
    <div className=" flex flex-col gap-8  justify-center">
      <div className='flex gap-2 justify-center items-center' >
        <Select
          items={source} size="sm"
          label="源语言"
          selectedKeys={[sourceLang]}
          onChange={(e) => setSourceLang(e.target.value)}
        >
          {(animal) => <SelectItem key={animal.value}>{animal.label}</SelectItem>}
        </Select>
        <Logo className="w-6 h-12"></Logo>
        <Select
          items={source} size="sm"
          label="目标语言"
          selectedKeys={[targetLang]}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          {(animal) => <SelectItem key={animal.value}>{animal.label}</SelectItem>}
        </Select>
      </div>
      <Textarea
        label="补充描述"
        placeholder="输入一些其他信息，便于更精确的术语翻译，比如'这是一篇经济学的论文'"
      />
      <Button isDisabled={!(sourceLang && targetLang && targetLang !== sourceLang)} radius="full"
        onClick={translateRequest}
        className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg">
        翻译
      </Button>
    </div>
  );
};

export default App;
