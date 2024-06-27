import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Divider, CardFooter, Chip, Textarea, Button, Spacer, Tooltip } from "@nextui-org/react";
import { ChromeAction } from "../constant";
import { WordType } from "./WordType";

export default (props:WordType) => {
  const { word, lines, translated = [], count } = props;
  const [line, setLine] = useState('')
  const [wordSorce, setWordSorce] = useState('')
  const [loading, setLoading] = useState(false)
  const [corret, setCorret] = useState('')

  const requestWordSource = async () => {
    setLoading(true)

    chrome.runtime.sendMessage({
      action: ChromeAction.ForWordSource, payload: {
        word
      }
    }, function (response) {
      setLoading(false)

      response && setWordSorce(response)
    });
  }
  const requestCorrect = () => {
    setLoading(true)
    chrome.runtime.sendMessage({
      action: ChromeAction.CorrectLine, payload: {
        word, line
      }
    }, function (response) {
      setLoading(false)
      response && setCorret(response)
    });
  }
  return (

    <Card
      isFooterBlurred
      radius="lg"
      className="min-w-max"
    >
      <CardHeader>
        <div className="flex-1"></div>
        <div className="text-2xl font-bold	">
          <p>{word}</p>

        </div>
        <div className="flex-1"></div>
        <Chip color={count > 10 ? "warning" : 'success'} variant="flat">{`陌生度${count || 0}`}</Chip>



      </CardHeader>
      <Divider></Divider>
      <CardBody>

        <div className="flex flex-col gap-3 text-slate-300		">
          <div className='italic text-lg font-bold'>例句和释义</div>
          {
            (lines || []).map((line: string, index: number) => {
              return (
                <div className='flex items-center'>
                  <div key={index}>{`${index + 1}. ${line}`}</div>
                  {translated[index] ?
                    <Tooltip className="bg-slate-800 text-slate-50 p-3 " content={translated[index]} >

                      <Chip variant="bordered" color="success" size="sm">释义</Chip>
                    </Tooltip> : null}</div>
              )
            })
          }
          <Spacer y={2}></Spacer>
          <div className='italic text-lg font-bold' >词源</div>
          {wordSorce ? <>{wordSorce}</> : <Button isLoading={loading} color="primary" onClick={requestWordSource}>获取词源</Button>}
        </div>

      </CardBody>
      <Divider></Divider>
      <CardFooter>
        <div className="flex flex-col gap-4 w-full items-end ">
          <div className="flex flex-row gap-2 w-full items-end" >
            <Textarea value={line} onChange={(e) => {
              if (e.target.value.length < 200) {
                setLine(e.target.value)
              }
            }} placeholder="在这里造句，让AI来纠正你的拼写或者语法错误,不超过200字" maxLength={200} maxRows={20} className="flex-1"></Textarea>
            <Button color="primary" isDisabled={!line.length} isLoading={loading} onClick={requestCorrect}>AI指导</Button>
          </div>
          {
            corret ? <>
              <Textarea label='AI 点评' readOnly maxRows={20} value={corret}></Textarea>
            </> : null
          }
        </div>

      </CardFooter>
    </Card>
  );
}
