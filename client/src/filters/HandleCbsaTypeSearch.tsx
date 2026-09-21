import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { useState, type ChangeEvent } from "react";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";

export default function HandleCbsaTypeSearch() {
    const [checked, setChecked] = useState([false, false]);
    const { setFilter } = useCollegesUniversities();

    function cbsaTypeFromChecked([metro, micro]: boolean[]): number | null {
      if (metro && micro) return null;
      if (metro) return 1;
      if (micro) return 2;
      return null;
    }

    const handleToggle =
      (index: 0 | 1) => (event: ChangeEvent<HTMLInputElement>) => {
        const next: [boolean, boolean] = [...checked] as [boolean, boolean];
        next[index] = event.target.checked;
        setChecked(next);
        setFilter({ cbsaType: cbsaTypeFromChecked(next) });
      };

  return (
    <Box sx={{ mx: 1, my: 1 }}>
      <Typography sx={{ textAlign: "left" }}>Search by area type</Typography>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={checked[0]} onChange={handleToggle(0)} />}
          label="Metropolitan"
        />
        <FormControlLabel
          control={<Checkbox checked={checked[1]} onChange={handleToggle(1)} />}
          label="Micropolitan "
        />
      </FormGroup>
    </Box>
  );
}
