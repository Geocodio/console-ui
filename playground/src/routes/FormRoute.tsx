import { Field, Select, type SelectOption, Textarea, TextInput } from '@geocodio/console-ui';
import { useState } from 'react';

const SELECT_OPTIONS: SelectOption[] = [
    { value: 'nc', label: 'North Carolina' },
    { value: 'sc', label: 'South Carolina' },
    { value: 'wa', label: 'Washington', disabled: true },
    { value: 'or', label: 'Oregon' },
];

export function FormRoute() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [notes, setNotes] = useState('');
    const [state, setState] = useState<string | null>(null);
    const [selectResult, setSelectResult] = useState('none');

    return (
        <div className="max-w-sm text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Form</h1>

            <div className="flex flex-col gap-4">
                <Field label="Source name">
                    <TextInput
                        data-testid="input-name"
                        value={name}
                        onChange={(event) => setName(event.currentTarget.value)}
                        placeholder="Wake County parcels"
                    />
                </Field>

                <Field label="Notification email" description="We'll send build failures here.">
                    <TextInput
                        data-testid="input-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.currentTarget.value)}
                    />
                </Field>

                <Field label="Password" error="Must be at least 8 characters.">
                    <TextInput
                        data-testid="input-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                    />
                </Field>

                <Field label="Archived source name">
                    <TextInput data-testid="input-disabled" disabled defaultValue="Locked" />
                </Field>

                <Field label="State">
                    <Select
                        options={SELECT_OPTIONS}
                        value={state}
                        onChange={(value) => {
                            setState(value);
                            setSelectResult(value ?? 'none');
                        }}
                        placeholder="Choose a state"
                        className="select-trigger"
                    />
                </Field>
                <p className="text-[12px] text-muted">
                    Selected state: <span data-testid="select-result">{selectResult}</span>
                </p>

                <Field label="Disabled select">
                    <Select options={SELECT_OPTIONS} value={null} onChange={() => {}} disabled />
                </Field>

                <Field label="Notes" description="Shown to the on-call operator.">
                    <Textarea
                        data-testid="textarea-notes"
                        rows={3}
                        value={notes}
                        onChange={(event) => setNotes(event.currentTarget.value)}
                        placeholder="Anything the next person should know"
                    />
                </Field>
                <p className="text-[12px] text-muted">
                    Notes length: <span data-testid="textarea-length">{notes.length}</span>
                </p>

                <Field label="Rejection reason" error="Give the submitter something to act on.">
                    <Textarea data-testid="textarea-error" defaultValue="Too short" />
                </Field>

                <h2 className="mt-4 text-[14px] font-semibold">Keyboard focus</h2>
                <button
                    type="button"
                    data-testid="before-focus-input"
                    className="w-fit rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                >
                    Click me first
                </button>
                <TextInput data-testid="focus-input" placeholder="Tab to me" />
            </div>
        </div>
    );
}
