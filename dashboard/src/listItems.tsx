import DashboardIcon from "@mui/icons-material/Dashboard";
import MergeIcon from "@mui/icons-material/Merge";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import * as React from "react";

export const mainListItems = (
  <React.Fragment>
    <ListItemButton>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <MergeIcon />
      </ListItemIcon>
      <ListItemText primary="Pull Requests" />
    </ListItemButton>
  </React.Fragment>
);
