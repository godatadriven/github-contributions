import Typography from "@mui/material/Typography";
import * as React from "react";
import Title from "./Title";

interface KPIProps {
  title: string;
  kpiValue: number;
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
