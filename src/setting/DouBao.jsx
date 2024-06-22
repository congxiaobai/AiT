import { useEffect, useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { useToast } from 'tw-noti';

export default () => {
  const { enqueueToast } = useToast();
  const [value, setValue] = useState({
    doubao_apiSecret: '',
    doubao_endpointId: ''
  });
  const [canSubmit, setCanSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    chrome?.storage?.sync?.get(['doubao_apiSecret', 'doubao_endpointId'], (items) => {
      items && setValue(items);
    });
  }, []);
  useEffect(() => {
    if (value.doubao_apiSecret && value.doubao_endpointId) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [value]);
  const submit = () => {
    setLoading(true);
    chrome.storage.sync.set(
      {
        doubao_apiSecret: value.doubao_apiSecret,
        doubao_endpointId: value.doubao_endpointId
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
        value={value.doubao_apiSecret}
        onClear={() => setValue({ ...value, doubao_apiSecret: '' })}
        onChange={(e) => setValue({ ...value, doubao_apiSecret: e.target.value })}
      />
      <Input
        label="ENDPOINT_ID"
        isRequired
        placeholder="请在官网获取"
        isClearable={true}
        className="max-w-xs"
        value={value.doubao_endpointId}
        onClear={() => setValue({ ...value, doubao_endpointId: '' })}
        onChange={(e) => setValue({ ...value, doubao_endpointId: e.target.value })}
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
