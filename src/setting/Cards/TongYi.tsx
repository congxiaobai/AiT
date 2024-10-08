import { useEffect, useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { useToast } from 'tw-noti';
import React from 'react';

export default () => {
  const { enqueueToast } = useToast();
  const [value, setValue] = useState({
    tongyi_apiKey: '',
  });
  const [canSubmit, setCanSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    chrome?.storage?.sync?.get(['tongyi_apiKey'], (items) => {
      items && setValue(items);
    });
  }, []);
  useEffect(() => {
    if (value.tongyi_apiKey) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [value]);
  const submit = () => {
    setLoading(true);
    chrome.storage.sync.set(
      {
        tongyi_apiKey: value.tongyi_apiKey,
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
        value={value.tongyi_apiKey}
        onClear={() => setValue({ tongyi_apiKey: '' })}
        onChange={(e) => setValue({ tongyi_apiKey: e.target.value })}
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
