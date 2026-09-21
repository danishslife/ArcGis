import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";

export default function HandleLocaleSearch() {
  const { filters, setFilter } = useCollegesUniversities();
  return (
    <Box sx={{ mx: 1, my: 1 }}>
      <Typography sx={{ textAlign: "left" }}>
        Search By Urban–Rural Locale
      </Typography>
      <Autocomplete
        multiple
        disablePortal
        options={LocaleOptions}
        value={LocaleOptions.filter((option) =>
          (filters.locale ?? []).includes(option.code),
        )}
        isOptionEqualToValue={(option, selected) =>
          option.code === selected.code
        }
        onChange={(_event, value) =>
          setFilter({
            locale: value.length > 0 ? value.map((option) => option.code) : null,
          })
        }
        getOptionLabel={(option) => option.title}
        sx={{ mt: 1, width: "100%" }}
        renderInput={(params) => (
          <TextField {...params} label="Urban–Rural Locale" />
        )}
      />
    </Box>
  );
}

const LocaleOptions = [
  { title: "City: Large", code: 11 },
  { title: "City: Midsize", code: 12 },
  { title: "City: Small", code: 13 },
  { title: "Suburb: Large", code: 21 },
  { title: "Suburb: Midsize", code: 22 },
  { title: "Suburb: Small", code: 23 },
  { title: "Town: Fringe", code: 31 },
  { title: "Town: Distant", code: 32 },
  { title: "Town: Remote", code: 33 },
  { title: "Rural: Fringe", code: 41 },
  { title: "Rural: Distant", code: 42 },
  { title: "Rural: Remote", code: 43 },
  { title: "Not available", code: -3 },
];
