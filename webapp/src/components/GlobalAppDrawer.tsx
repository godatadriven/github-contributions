import { Drawer, DrawerProps, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Box from '@mui/material/Box';
import routes from '../router/routes.tsx';


interface GlobalAppDrawerProps {
    drawerProps: DrawerProps;
}
export default function GlobalAppDrawer(props: GlobalAppDrawerProps) {

    return (
        <Drawer
            {...props.drawerProps}
        >
            <Box
                sx={{ width: 250 }}
                role="presentation"
            >
                <List>
                    {routes.map(route => (
                        <ListItem key={route.id} disablePadding>
                            <ListItemButton href={route.path}>
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={route.icon} />
                                </ListItemIcon>
                                <ListItemText primary={route.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

        </Drawer>
    );
}
