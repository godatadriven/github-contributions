import { CircularProgress, Container, Typography } from '@mui/material';

interface GlobalSpinnerProps {
    text?: string
}

function GlobalSpinner({
    text
}: GlobalSpinnerProps) {
    return (
        <Container
            fixed
            maxWidth="xl"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <CircularProgress />
            {!!text && <Typography variant="h6" marginLeft="20px">{text}</Typography>}
        </Container>);
}

export default GlobalSpinner;