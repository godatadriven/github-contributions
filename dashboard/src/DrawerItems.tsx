import DashboardIcon from "@mui/icons-material/Dashboard";
import MergeIcon from "@mui/icons-material/Merge";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useRouter } from "next/router";

import * as React from "react";

const DrawerItems = () => {
  const router = useRouter();
  const goToPullRequests = () => {
    router.push("/pull_requests.html");
  };
  return (
    <React.Fragment>
      <ListItemButton>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItemButton>
      <ListItemButton onClick={goToPullRequests}>
        <ListItemIcon>
          <MergeIcon />
        </ListItemIcon>
        <ListItemText primary="Pull Requests" />
      </ListItemButton>
    </React.Fragment>
  );
};

export default DrawerItems;
