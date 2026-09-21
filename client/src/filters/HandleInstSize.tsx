import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { Typography } from "@mui/material";
import { useState } from "react";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";

export default function HandleInstSize() {
  const { setFilter } = useCollegesUniversities();
  const [value, setValue] = useState<number[]>([1, 5]);

  const handleChange = (event: Event, newValue: number[]) => {
    setValue(newValue);
    setFilter({ instSize: newValue });
  };

  function valueLabelFormat(value: any) {
    switch (value) {
      case 1:
        return "Under 1,000";
      case 2:
        return "1,000 - 4,999";
      case 3:
        return "5,000 - 9,999";
      case 4:
        return "10,000 - 19,999";
      case 5:
        return "20,000 and above";
    }
  }

  return (
    <Box sx={{ mx: 1, my: 1 }}>
      <Typography sx={{ textAlign: "left" }}>
        Search By Institution Size
      </Typography>
      <Box sx={{ mx: 7, my: 1 }}>
        <Slider
          getAriaLabel={() => "Institution Size"}
          value={value}
          onChange={handleChange}
          valueLabelDisplay="auto"
          valueLabelFormat={valueLabelFormat}
          marks
          step={1}
          min={1}
          max={5}
          sx={{ mt: 1 }}
        />
      </Box>
    </Box>
  );
}
