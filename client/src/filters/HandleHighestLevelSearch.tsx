import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";

export default function HandleHighestLevelSearch() {
  const { filters, setFilter } = useCollegesUniversities();
  return (
    <Box sx={{ mx: 1, my: 1 }}>
      <Typography sx={{ textAlign: "left" }}>
        Search By Highest Level Offered
      </Typography>
      <Autocomplete
        multiple
        disablePortal
        options={HighestLevelOffering}
        value={HighestLevelOffering.filter((option) =>
          (filters.highestLevelOffering ?? []).includes(option.code),
        )}
        isOptionEqualToValue={(option, selected) =>
          option.code === selected.code
        }
        onChange={(_event, value) =>
          setFilter({
            highestLevelOffering: value.map((option) => option.code),
          })
        }
        getOptionLabel={(option) => option.title}
        sx={{  mt: 1 , width: "100%" }}
        renderInput={(params) => (
          <TextField {...params} label="Highest Level Offered" />
        )}
      />
    </Box>
  );
}

const HighestLevelOffering = [
  { title: "Award of less than one academic year", code: 1 },
  { title: "At least 1, but less than 2 academic years", code: 2 },
  { title: "Associate's degree", code: 3 },
  { title: "At least 2, but less than 4 academic years", code: 4 },
  { title: "Bachelor's degree", code: 5 },
  { title: "Postbaccalaureate certificate", code: 6 },
  { title: "Master's degree", code: 7 },
  { title: "Post-master's certificate", code: 8 },
  { title: "Doctor's degree", code: 9 },
  { title: "Not available", code: -3 },
];
