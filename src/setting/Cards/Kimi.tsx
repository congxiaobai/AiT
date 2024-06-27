import { useEffect, useState } from 'react'
import { Input, Button } from "@nextui-org/react";
import { useToast } from 'tw-noti';
import React from 'react';

export default () => {
    const { enqueueToast } = useToast();
    const [value, setValue] = useState({
        kimi_apiKey: ''
    })
    const [canSubmit, setCanSubmit] = useState(false)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        chrome?.storage?.sync?.get(['kimi_apiKey'], (items) => {
            items && setValue(items)
        });
    }, [])
    useEffect(() => {
        if (value.kimi_apiKey) {
            setCanSubmit(true)
        } else {
            setCanSubmit(false)
        }
    }, [value])
    const submit = () => {
        setLoading(true)
        chrome.storage.sync.set({
            kimi_apiKey: value.kimi_apiKey,

        }, () => {
            setLoading(false)
            if (chrome.runtime.lastError) {
                enqueueToast({ content: '保存失败', type: 'error' })
            } else {
                enqueueToast({ content: '保存成功', type: 'success' })
            }
        })

    }
    return <div className="flex flex-col gap-6 p-2">
        <Input
            label="ApiKey" isRequired
            className="max-w-xs" isClearable={true}
            value={value.kimi_apiKey}
            onChange={(e) => setValue({kimi_apiKey: e.target.value })}
            onClear={() => setValue({kimi_apiKey: '' })}
        />

        <div>
            <Button isLoading={loading} color="primary" isDisabled={!canSubmit} onClick={submit}>保存</Button>
        </div>

    </div>
}