import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from '@mui/material';

interface SelectBoxProps {
    items: string[];
    value: string;
    label: string;
    onSelect: (value: string) => void;
}

function SelectBox({
    items,
    value,
    label,
    onSelect,
}: SelectBoxProps) {
    function onChange(event: SelectChangeEvent) {
        onSelect(event.target.value as string);
    }

    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">{label}</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={value}
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