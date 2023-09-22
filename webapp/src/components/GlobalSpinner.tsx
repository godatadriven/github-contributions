import { CircularProgress, Container } from '@mui/material';

function GlobalSpinner() {
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
        </Container>);
}

export default GlobalSpinner;