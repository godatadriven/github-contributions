import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useState } from 'react';

interface SelectBoxProps {
    items: string[];
    label: string;
    initialSelection: string;
    onChangeValue: (value: string) => void;
}

function SelectBox({
    items,
    label,
    initialSelection,
    onChangeValue,
}: SelectBoxProps) {
    const [selected, setSelected] = useState(initialSelection);

    function onChange(event: SelectChangeEvent) {
        setSelected(event.target.value as string);
        onChangeValue(event.target.value as string);
    }
    
    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">{label}</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selected}
                label={label}
                onChange={onChange}
            >
                {items.map(item => (
                    <MenuItem value={item} key={`${item}`}>{item}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default SelectBox;