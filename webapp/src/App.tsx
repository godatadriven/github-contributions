import Router from './router/Router.tsx';

import { Container, CssBaseline, PaletteMode, ThemeProvider, createTheme } from '@mui/material';
import { DuckDBAccessMode, DuckDBConfig } from '@duckdb/duckdb-wasm';
import { useEffect, useState } from 'react';
import { initializeDuckDb } from 'duckdb-wasm-kit';

import GlobalAppBar from './components/GlobalAppBar.tsx';
import GlobalAppDrawer from './components/GlobalAppDrawer.tsx';
import GlobalSpinner from './components/GlobalSpinner.tsx';

const duckDbConfig: DuckDBConfig = {
    query: {
        castBigIntToDouble: true,
    },
    path: './github_contributions.duckdb',
    accessMode: DuckDBAccessMode.AUTOMATIC,
};


function App() {
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mode, setMode] = useState<PaletteMode>('light');

    const theme = createTheme({
        palette: {
            mode: mode,
            primary: {
                main: mode == 'light' ? '#4a1e47' : '#AD1A99',
            },
            secondary: {
                main: '#f50057',
            },
        },
    });

    useEffect(() => {
        const setupApplication = async () => {
            await initializeDuckDb({ config: duckDbConfig, debug: false });
            setLoading(false);
        };

        void setupApplication();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <GlobalAppBar
                onClickDrawerIcon={() => setDrawerOpen(true)}
                mode={mode}
                onToggleMode={() => setMode(mode == 'light' ? 'dark' : 'light')}
            />
            <CssBaseline />
            <GlobalAppDrawer
                drawerProps={{
                    anchor: 'left',
                    open: drawerOpen,
                    onClose: () => setDrawerOpen(false)
                }}
                onClickDrawerItem={() => setDrawerOpen(false)}
            />
            <Container fixed maxWidth="xl" style={{ marginTop: '50px', marginBottom: '50px' }}>
                {loading ? <GlobalSpinner text="Fetching and initializing duckdb..."/> : <Router />}
            </Container>
        </ThemeProvider>
    );
}

export default App;