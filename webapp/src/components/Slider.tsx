import { FormControl, FormLabel, Slider as MSlider, SliderProps as MSliderProps } from '@mui/material';

interface SliderProps {
    label: string;
    sliderProps: MSliderProps;
}
function Slider({
    label,
    sliderProps,
}: SliderProps) {

    return (
        <FormControl fullWidth>
            <FormLabel id="demo-simple-select-label">{label}</FormLabel>
            <MSlider
                {...sliderProps}
            />
        </FormControl>
    );
}

export default Slider;