import { useEffect, useState } from 'react'
import { Tabs, Tab, Card, CardBody, CardHeader, Divider, Input, Button, Link } from "@nextui-org/react";

export default () => {
    const [value, setValue] = useState({
        appId: '',
        apiSecret: '',
        apiKey: ''
    })
    const [canSubmit, setCanSubmit] = useState(false)
    useEffect(() => {
        if (value.apiKey && value.apiSecret && value.appId) {
            setCanSubmit(true)
        } else {
            setCanSubmit(false)
        }
    }, [value])
    const submit = () => {
        chorme.storage.local.set({
            spark_appId: value.appId,
            spark_apiSecret: value.apiSecret,
            spark_apiKey: value.apiKey
        })
    }
    return <div className="flex flex-col gap-6 p-2">
        <Input
            label="APPID" isRequired
            defaultValue="请在官网获取"
            className="max-w-xs" isClearable={true}
            value={value.appId}
            onChange={(e) => setValue({ ...value, appId: e.target.value })}
        />
        <Input
            label="API_SECRET" isRequired
            defaultValue="请在官网获取" isClearable={true}
            className="max-w-xs" value={value.apiSecret}
            onChange={(e) => setValue({ ...value, apiSecret: e.target.value })}

        />
        <Input
            label="API_KEY" isRequired
            defaultValue="请在官网获取" isClearable={true}
            className="max-w-xs" value={value.apiKey}
            onChange={(e) => setValue({ ...value, apiKey: e.target.value })}

        />
        <div>
            <Button color="primary" isDisabled={!canSubmit} onClick={submit}>提交</Button>
        </div>

    </div>
}