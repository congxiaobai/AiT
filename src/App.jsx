import { Button } from '@nextui-org/react';

import { Select, SelectItem } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";

import Logo from '../public/arrow.svg?react'
import SetIcon from '../public/setting.svg?react'
import { useEffect, useState } from 'react';
const source = [
  { label: "英文", value: "en" },
  { label: "中文", value: "zh" },
  { label: "日文", value: "ja" },
  { label: "法文", value: "fr" },
  { label: "德文", value: "de" }
]

const App = () => {
  const preferredLanguage = navigator.language.split('-')[0];
  const [sourceLang, setSourceLang] = useState()
  const [targetLang, setTargetLang] = useState(preferredLanguage);
  const [text, setText] = useState('');
  useEffect(() => {
    chrome?.storage?.sync?.get(['detecLang'], (items) => {
      setSourceLang(items.detecLang)
    });
  }, []);
  const translateRequest = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "translateRequest", params: {
          sourceLang,
          text,
          targetLang,
        }
      }, response => {
        console.log(response.farewell);
      });
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
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入一些其他信息，便于更精确的术语翻译，比如'这是一篇经济学的论文'"
      />
      <Button isDisabled={!(sourceLang && targetLang && targetLang !== sourceLang)} radius="full"
        onClick={translateRequest}
        className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg">
        翻译
      </Button>
      <div>
        <Button isIconOnly size='sm' onClick={() => {
          chrome.tabs.create({ url: 'setting.html' })
        }}>
          <SetIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default App;
