import { Box, Slider, Typography, } from '@mui/material';
import { useState } from 'react';

interface DiscreteSliderProps {
    label: string;
    title: string;
    defaultValue: number;
    onChangeValue: (value: number) => void;
    step: number;
    min: number;
    max: number;
}

function DiscreteSlider({
    label,
    title,
    defaultValue,
    onChangeValue,
    ...rest
}: DiscreteSliderProps) {
    const [selected, setSelected] = useState(defaultValue);

    function handleChange(_: Event, value: number | number[]) {
        setSelected(value as number);
        onChangeValue(value as number);
    }
    
    return (
      <Box>
        <Typography id="input-slider" gutterBottom>
        {title}
        </Typography>
        <Slider
          aria-label={label}
          defaultValue={selected}
          valueLabelDisplay="auto"
          onChange={handleChange}
          {...rest}
        />
      </Box>
    );
  }

export default DiscreteSlider;