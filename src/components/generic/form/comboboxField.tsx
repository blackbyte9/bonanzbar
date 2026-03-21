"use client";

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/shadcn/components/ui/combobox";

type ComboboxFieldProps = {
    id: string;
    label: string;
    placeholder: string;
    items: string[];
    value: string;
    onValueChangeAction: (value: string) => void;
    emptyMessage: string;
    onFocusAction?: () => void;
    disabled?: boolean;
    required?: boolean;
    inputClassName?: string;
};

export default function ComboboxField({
    id,
    label,
    placeholder,
    items,
    value,
    onValueChangeAction,
    emptyMessage,
    onFocusAction,
    disabled = false,
    required = false,
    inputClassName = "h-9 rounded-md border px-3 text-sm",
}: ComboboxFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium">{label}</label>
            <Combobox
                items={items}
                value={value || null}
                onValueChange={(selectedValue) => onValueChangeAction(selectedValue ?? "")}
                onInputValueChange={(inputValue) => onValueChangeAction(inputValue)}
            >
                <ComboboxInput
                    id={id}
                    placeholder={placeholder}
                    onFocus={onFocusAction}
                    disabled={disabled}
                    className={inputClassName}
                    required={required}
                />
                <ComboboxContent>
                    <ComboboxEmpty className="p-2 text-sm text-muted-foreground">{emptyMessage}</ComboboxEmpty>
                    <ComboboxList>
                        {(item) => (
                            <ComboboxItem key={item} value={item}>
                                {item}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}
