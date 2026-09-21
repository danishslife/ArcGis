import * as React from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";

export default function HandleControlSearch() {
  const { filters, setFilter } = useCollegesUniversities();

  const applySearchFilter = (
    _event: React.MouseEvent<HTMLElement>,
    value: number[],
  ) => {
    setFilter({ control: value });
  };

  return (
    <Box sx={{ mx: 1, my: 1 }}>
      <Typography sx={{ textAlign: "left" }}>
        Search By Control of institution
      </Typography>
      <ToggleButtonGroup
        color="primary"
        orientation="vertical"
        value={filters.control ?? null}
        onChange={applySearchFilter}
        sx={{ mt: 1, width: '100%'}}
      >
        <ToggleButton value="1">Public</ToggleButton>
        <ToggleButton value="2">Private, non-profit</ToggleButton>
        <ToggleButton value="3">Private, for-profit</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
