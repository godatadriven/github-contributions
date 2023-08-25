import Typography from "@mui/material/Typography";
import * as React from "react";
import Title from "./Title";

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

interface KPIProps {
  title: string;
  kpiValue: string;
  subTitle: string;
}

export default function KPI({ title, kpiValue, subTitle }: KPIProps) {
  return (
    <React.Fragment>
      <Title>{title}</Title>
      <Typography component="p" variant="h4">
        {kpiValue}
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        {subTitle}
      </Typography>
    </React.Fragment>
  );
}
