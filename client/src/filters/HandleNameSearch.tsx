import { type ChangeEvent } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";

export default function HandleNameSearch() {
  const { filters, setFilter } = useCollegesUniversities();

  const applySearchFilter = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFilter({ name: event.target.value });
  };

  return (
    <Box sx={{ mx: 1, my: 1 }}>
      <Typography sx={{ textAlign: "left" }}>Search By Name</Typography>
      <TextField
        id="institution-name-search"
        label="Name"
        variant="filled"
        value={filters.name ?? ""}
        onChange={applySearchFilter}
        fullWidth
        sx={{ mt: 1 }}
      />
    </Box>
  );
}
