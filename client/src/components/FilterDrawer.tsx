import Drawer from "@mui/material/Drawer";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HandleNameSearch from "../filters/HandleNameSearch";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { styled, useTheme } from "@mui/material/styles";
import HandleStateSearch from "../filters/HandleStateSearch";
import HandleCitySearch from "../filters/HandleCitySearch";
import HandleControlSearch from "../filters/HandleControlSearch";
import HandleHighestLevelSearch from "../filters/HandleHighestLevelSearch";
import HandleBeaRegionSearch from "../filters/HandleBeaRegionSearch";
import HandleInstSize from "../filters/HandleInstSize";
import HandleCbsaTypeSearch from "../filters/HandleCbsaTypeSearch";
import HandleLocaleSearch from "../filters/HandleLocaleSearch";

type FilterDrawerProps = {
  handleDrawerClose: () => void;
  drawerWidth: number;
  open: boolean;
  variant?: "persistent" | "temporary";
};

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const FilterDrawer = ({
  handleDrawerClose,
  drawerWidth,
  open,
  variant = "persistent",
}: FilterDrawerProps) => {
  const theme = useTheme();

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: "min(100vw, 320px)", sm: drawerWidth },
        },
      }}
      variant={variant}
      anchor="left"
      open={open}
      onClose={handleDrawerClose}
      ModalProps={{ keepMounted: true }}
    >
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "ltr" ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <HandleNameSearch />
      <HandleStateSearch />
      <HandleCitySearch />
      <HandleControlSearch />
      <HandleHighestLevelSearch />
      <HandleBeaRegionSearch />
      <HandleInstSize />
      <HandleCbsaTypeSearch />
      <HandleLocaleSearch />
    </Drawer>
  );
};

export default FilterDrawer;
