import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import states from "us-state-converter";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";

const STATE_OPTIONS = states().map((state) => state.name);

export default function HandleStateSearch() {
  const { filters, setFilter } = useCollegesUniversities();

  return (
    <Box sx={{ mx: 1, my: 1 }}>
      <Typography sx={{ textAlign: "left" }}>Search By State</Typography>
      <Autocomplete
        multiple
        disablePortal
        options={STATE_OPTIONS}
        value={filters.state ?? []}
        sx={{ mt: 1 }}
        renderInput={(params) => <TextField {...params} label="State" />}
        onChange={(_event, value) => setFilter({ state: value })}
      />
    </Box>
  );
}
