import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PaletteMode } from '@mui/material';
import { faMoon as faMoonRegular } from '@fortawesome/free-regular-svg-icons/faMoon';
import { faMoon as faMoonSolid } from '@fortawesome/free-solid-svg-icons/faMoon';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

interface GlobalAppBarProps {
    onClickDrawerIcon: () => void;
    mode: PaletteMode;
    onToggleMode: () => void;
}
export default function GlobalAppBar({
    onClickDrawerIcon,
    mode,
    onToggleMode
 }: GlobalAppBarProps) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={onClickDrawerIcon}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Github Contributions
                    </Typography>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={onToggleMode}
                        color="inherit"
                    >
                        <FontAwesomeIcon icon={mode == 'light' ? faMoonSolid : faMoonRegular}  />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
