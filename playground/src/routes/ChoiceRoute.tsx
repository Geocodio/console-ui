import { Checkbox, RadioGroup, type RadioOption, Toggle } from '@geocodio/console-ui';
import { useState } from 'react';

const PLAN_OPTIONS: RadioOption[] = [
    { value: 'monthly', label: 'Monthly', description: 'Billed every month' },
    { value: 'annual', label: 'Annual', description: 'Billed once a year' },
    { value: 'lifetime', label: 'Lifetime', disabled: true },
];

const SIZE_OPTIONS: RadioOption[] = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
];

export function ChoiceRoute() {
    const [agree, setAgree] = useState(false);
    const [agreeCount, setAgreeCount] = useState(0);
    const [selectAll, setSelectAll] = useState<boolean | 'indeterminate'>('indeterminate');
    const [selectAllCount, setSelectAllCount] = useState(0);
    const [plan, setPlan] = useState<string | null>('monthly');
    const [planCount, setPlanCount] = useState(0);
    const [size, setSize] = useState<string | null>('md');
    const [notifications, setNotifications] = useState(true);
    const [notificationsCount, setNotificationsCount] = useState(0);

    return (
        <div className="max-w-sm text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Choice</h1>

            <div className="flex flex-col gap-6">
                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">Checkbox</h2>
                    <Checkbox
                        data-testid="checkbox-agree"
                        checked={agree}
                        onCheckedChange={(next) => {
                            setAgree(next);
                            setAgreeCount((count) => count + 1);
                        }}
                        label="I agree to the terms"
                    />
                    <p className="text-[12px] text-muted">
                        onCheckedChange calls: <span data-testid="checkbox-agree-count">{agreeCount}</span>
                    </p>

                    <Checkbox
                        data-testid="checkbox-select-all"
                        checked={selectAll}
                        onCheckedChange={(next) => {
                            setSelectAll(next);
                            setSelectAllCount((count) => count + 1);
                        }}
                        label="Select all rows"
                    />
                    <p className="text-[12px] text-muted">
                        onCheckedChange calls: <span data-testid="checkbox-select-all-count">{selectAllCount}</span>
                    </p>

                    <Checkbox checked={false} onCheckedChange={() => {}} label="Archived source" disabled />

                    <Checkbox checked={true} onCheckedChange={() => {}} label="Hidden label checkbox" hideLabel />
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">RadioGroup (vertical)</h2>
                    <RadioGroup
                        data-testid="radio-plan"
                        label="Billing plan"
                        options={PLAN_OPTIONS}
                        value={plan}
                        onChange={(value) => {
                            setPlan(value);
                            setPlanCount((count) => count + 1);
                        }}
                    />
                    <p className="text-[12px] text-muted">
                        Selected plan: <span data-testid="radio-plan-value">{plan}</span> -- onChange calls:{' '}
                        <span data-testid="radio-plan-count">{planCount}</span>
                    </p>
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">RadioGroup (horizontal)</h2>
                    <RadioGroup
                        data-testid="radio-size"
                        label="Size"
                        options={SIZE_OPTIONS}
                        value={size}
                        onChange={setSize}
                        orientation="horizontal"
                    />
                    <p className="text-[12px] text-muted">
                        Selected size: <span data-testid="radio-size-value">{size}</span>
                    </p>
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">RadioGroup (disabled)</h2>
                    <RadioGroup
                        data-testid="radio-disabled"
                        label="Disabled group"
                        options={SIZE_OPTIONS}
                        value="sm"
                        onChange={() => {}}
                        disabled
                    />
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">Toggle</h2>
                    <div className="flex items-center gap-2">
                        <Toggle
                            data-testid="toggle-notifications"
                            checked={notifications}
                            onCheckedChange={(next) => {
                                setNotifications(next);
                                setNotificationsCount((count) => count + 1);
                            }}
                            label="Email notifications"
                        />
                        <span className="text-[13px]">Email notifications</span>
                    </div>
                    <p className="text-[12px] text-muted">
                        onCheckedChange calls: <span data-testid="toggle-notifications-count">{notificationsCount}</span>
                    </p>

                    <Toggle
                        data-testid="toggle-disabled"
                        checked={false}
                        onCheckedChange={() => {}}
                        label="Disabled toggle"
                        disabled
                    />
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">Native form elements</h2>
                    <label className="flex items-center gap-2 text-[13px]">
                        <input type="checkbox" data-testid="native-checkbox" />
                        Native checkbox
                    </label>
                    <label className="flex items-center gap-2 text-[13px]">
                        <input type="radio" name="native-radio" data-testid="native-radio" />
                        Native radio
                    </label>
                    <input type="checkbox" data-testid="native-checkbox-disabled" disabled />
                    <div role="tablist" className="flex gap-2">
                        <div
                            role="tab"
                            aria-selected="true"
                            tabIndex={0}
                            data-testid="native-tab"
                            className="text-[13px]"
                        >
                            Native tab
                        </div>
                    </div>
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">Keyboard focus</h2>
                    <button
                        type="button"
                        data-testid="before-focus-choice"
                        className="w-fit rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    >
                        Click me first
                    </button>
                    <Checkbox checked={false} onCheckedChange={() => {}} label="Focus target checkbox" id="focus-checkbox" />
                    <RadioGroup
                        label="Focus target radios"
                        options={[
                            { value: 'alpha', label: 'Alpha' },
                            { value: 'beta', label: 'Beta' },
                        ]}
                        value={null}
                        onChange={() => {}}
                    />
                    <Toggle checked={false} onCheckedChange={() => {}} label="Focus target toggle" />
                </section>
            </div>
        </div>
    );
}
