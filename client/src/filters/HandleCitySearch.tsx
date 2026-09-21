import { type ChangeEvent } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";

export default function HandleCitySearch() {
  const { filters, setFilter } = useCollegesUniversities();

  const applySearchFilter = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFilter({ city: event.target.value });
  };

  return (
    <Box sx={{ mx: 1, my: 1 }}>
      <Typography sx={{ textAlign: "left" }}>Search By City</Typography>
      <TextField
        id="institution-city-search"
        label="City"
        variant="filled"
        value={filters.city ?? ""}
        onChange={applySearchFilter}
        fullWidth
        sx={{ mt: 1 }}
      />
    </Box>
  );
}
