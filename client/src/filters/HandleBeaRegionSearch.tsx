import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";

export default function HandleBeaRegionSearch() {
  const { filters, setFilter } = useCollegesUniversities();
  return (
    <Box sx={{ mx: 1, my: 1 }}>
      <Typography sx={{ textAlign: "left" }}>
        Search By Bureau of Economic Analysis (BEA) region
      </Typography>
      <Autocomplete
        multiple
        disablePortal
        options={BeaRegion}
        value={BeaRegion.filter((option) =>
          (filters.beaRegion ?? []).includes(option.code),
        )}
        isOptionEqualToValue={(option, selected) =>
          option.code === selected.code
        }
        onChange={(_event, value) =>
          setFilter({
            beaRegion: value.map((option) => option.code),
          })
        }
        getOptionLabel={(option) => option.title}
        sx={{ mt: 1, width: "100%" }}
        renderInput={(params) => (
          <TextField
            {...params}
            label=" Bureau of Economic Analysis Region"
          />
        )}
      />
    </Box>
  );
}

const BeaRegion = [
  { title: "U.S. Service schools", code: 0 },
  { title: "New England (CT, ME, MA, NH, RI, VT)", code: 1 },
  { title: "Mid East (DE, DC, MD, NJ, NY, PA)", code: 2 },
  { title: "Great Lakes (IL, IN, MI, OH, WI)", code: 3 },
  { title: "Plains (IA, KS, MN, MO, NE, ND, SD)", code: 4 },
  {
    title: "Southeast (AL, AR, FL, GA, KY, LA, MS, NC, SC, TN, VA, WV)",
    code: 5,
  },
  { title: "Southwest (AZ, NM, OK, TX)", code: 6 },
  { title: "Rocky Mountains (CO, ID, MT, UT, WY)", code: 7 },
  { title: "Far West (AK, CA, HI, NV, OR, WA)", code: 8 },
  {
    title: "Other U.S. jurisdictions (AS, FM, GU, MH, MP, PR, PW, VI)",
    code: 9,
  },
];
