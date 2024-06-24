import { useEffect, useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { useToast } from 'tw-noti';

export default () => {
    const { enqueueToast } = useToast();
    const [value, setValue] = useState({
        ollama_model: '',
    });
    const [canSubmit, setCanSubmit] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        chrome?.storage?.sync?.get(['ollama_model'], (items) => {
            items && setValue(items);
        });
    }, []);
    useEffect(() => {
        if (value.ollama_model) {
            setCanSubmit(true);
        } else {
            setCanSubmit(false);
        }
    }, [value]);
    const submit = () => {
        setLoading(true);
        chrome.storage.sync.set(
            {
                ollama_model: value.ollama_model
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
                label="Models"
                isRequired
                placeholder="请在官网获取"
                isClearable={true}
                className="max-w-xs"
                value={value.ollama_model}
                onClear={() => setValue({ ...value, ollama_model: '' })}
                onChange={(e) => setValue({ ...value, ollama_model: e.target.value })}
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
