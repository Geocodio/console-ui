import { Combobox, type ComboboxOption, Field } from '@geocodio/console-ui';
import { useState } from 'react';

const MODEL_OPTIONS: ComboboxOption[] = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
    { value: 'claude-opus-4', label: 'Claude Opus 4' },
    { value: 'claude-sonnet-4', label: 'Claude Sonnet 4', description: 'Balanced cost and quality' },
    { value: 'claude-haiku-4', label: 'Claude Haiku 4' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', disabled: true },
    { value: 'llama-3-70b', label: 'Llama 3 70B' },
];

export function ComboboxRoute() {
    const [model, setModel] = useState<string | null>(null);
    const [modelResult, setModelResult] = useState('none');
    const [modelCount, setModelCount] = useState(0);

    const [customModel, setCustomModel] = useState<string | null>('claude-sonnet-4');
    const [customResult, setCustomResult] = useState('claude-sonnet-4');
    const [customCount, setCustomCount] = useState(0);

    const [focusModel, setFocusModel] = useState<string | null>(null);

    return (
        <div className="max-w-sm text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Combobox</h1>

            <div className="flex flex-col gap-6">
                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">Plain</h2>
                    <Field label="Model">
                        <Combobox
                            options={MODEL_OPTIONS}
                            value={model}
                            onChange={(value) => {
                                setModel(value);
                                setModelResult(value ?? 'none');
                                setModelCount((count) => count + 1);
                            }}
                            placeholder="Choose a model"
                            className="combobox-input"
                        />
                    </Field>
                    <p className="text-[12px] text-muted">
                        Selected model: <span data-testid="model-result">{modelResult}</span> (onChange calls:{' '}
                        <span data-testid="model-count">{modelCount}</span>)
                    </p>
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">allowCustom (ModelSelect)</h2>
                    <Field label="Model id" description="Pick one, or type an id that isn't listed.">
                        <Combobox
                            options={MODEL_OPTIONS}
                            value={customModel}
                            onChange={(value) => {
                                setCustomModel(value);
                                setCustomResult(value ?? 'none');
                                setCustomCount((count) => count + 1);
                            }}
                            placeholder="Choose or type a model id"
                            allowCustom
                            className="combobox-custom-input"
                        />
                    </Field>
                    <p className="text-[12px] text-muted">
                        Selected model id: <span data-testid="custom-result">{customResult}</span> (onChange calls:{' '}
                        <span data-testid="custom-count">{customCount}</span>)
                    </p>
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">Disabled</h2>
                    <Field label="Disabled combobox">
                        <Combobox options={MODEL_OPTIONS} value={null} onChange={() => {}} disabled />
                    </Field>
                </section>

                <h2 className="mt-4 text-[14px] font-semibold">Keyboard focus</h2>
                <button
                    type="button"
                    data-testid="before-focus-combobox"
                    className="w-fit rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                >
                    Click me first
                </button>
                <Field label="Tab target">
                    <Combobox options={MODEL_OPTIONS} value={focusModel} onChange={setFocusModel} />
                </Field>
            </div>
        </div>
    );
}
