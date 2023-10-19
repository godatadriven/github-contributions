import { Box, Slider, Typography, } from '@mui/material';
import { useState } from 'react';

interface SliderProps {
    label: string;
    title: string;
    defaultValue: number;
    stepSize: number;
    minValue: number;
    maxValue: number;
    onChangeValue: (value: number) => void;
}

function DiscreteSlider({
    label,
    title,
    defaultValue,
    stepSize,
    minValue,
    maxValue,
    onChangeValue,
}: SliderProps) {
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
          step={stepSize}
          min={minValue}
          max={maxValue}
          onChange={handleChange}
        />
      </Box>
    );
  }

export default DiscreteSlider;