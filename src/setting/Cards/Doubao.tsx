import { useEffect, useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { useToast } from 'tw-noti';
import React from 'react';

export default () => {
  const { enqueueToast } = useToast();
  const [value, setValue] = useState({
    doubao_apiKey: '',
    doubao_endpoint: '',
  });
  const [canSubmit, setCanSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    chrome?.storage?.sync?.get(['doubao_apiKey', 'doubao_endpoint'], (items) => {
      items && setValue(items);
    });
  }, []);
  useEffect(() => {
    if (value.doubao_apiKey && value.doubao_endpoint) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [value]);
  const submit = () => {
    setLoading(true);
    chrome.storage.sync.set(
      {
        doubao_apiKey: value.doubao_apiKey,
        doubao_endpoint: value.doubao_endpoint,
      },
      () => {
        setLoading(false);
        if (chrome.runtime.lastError) {
          enqueueToast({ content: '保存失败', type: 'error' });
        } else {
          enqueueToast({ content: '保存成功', type: 'success' });
        }
      },
    );
  };
  return (
    <div className="flex flex-col gap-6 p-2">
      <Input
        label="API_KEY"
        isRequired
        placeholder="请在官网获取"
        isClearable={true}
        className="max-w-xs"
        value={value.doubao_apiKey}
        onClear={() => setValue({ ...value, doubao_apiKey: '' })}
        onChange={(e) => setValue({ ...value, doubao_apiKey: e.target.value })}
      />
      <Input
        label="接入点"
        isRequired
        placeholder="请在官网获取"
        isClearable={true}
        className="max-w-xs"
        value={value.doubao_endpoint}
        onClear={() => setValue({ ...value, doubao_endpoint: '' })}
        onChange={(e) => setValue({ ...value, doubao_endpoint: e.target.value })}
      />
      <div>
        <Button
          isLoading={loading}
          color="primary"
          isDisabled={!canSubmit}
          onClick={submit}
        >
          保存
        </Button>
      </div>
    </div>
  );
};
