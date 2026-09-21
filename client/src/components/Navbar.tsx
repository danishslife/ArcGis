import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import type { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import FilterDrawer from "./FilterDrawer";
import ResultsPanel from "./ResultsPanel";
import Button from "@mui/material/Button";
import AuthDialog from "./AuthDialog";
import { useAuth } from "../useContext/authContext";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const drawerWidth = 420;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isMobile",
})<{
  open?: boolean;
  isMobile?: boolean;
}>(({ theme, open, isMobile }) => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  minWidth: 0,
  width: "100%",
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(isMobile
    ? { marginLeft: 0 }
    : {
        marginLeft: `-${drawerWidth}px`,
        ...(open && {
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 0,
        }),
      }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
  isMobile?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isMobile",
})<AppBarProps>(({ theme, open, isMobile }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(!isMobile &&
    open && {
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
}));

type NavbarProps = {
  children: React.ReactNode;
};

export default function Navbar({ children }: NavbarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(false);
    const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(
      null,
    );
    const navigate = useNavigate();

    const closeMenu = () => setMenuAnchor(null);
  const { user, logout, isAuthDialogOpen, openAuthDialog, closeAuthDialog } =
    useAuth();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100dvh",
        maxHeight: "100dvh",
      }}
    >
      <CssBaseline />
      <AppBar position="fixed" open={open} isMobile={isMobile}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerOpen}
            sx={[open && { display: "none" }]}
          >
            <MenuIcon />
          </IconButton>
          {user ? (
            <>
              <IconButton
                onClick={(event) => setMenuAnchor(event.currentTarget)}
                size="small"
                aria-label="account menu"
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: 15,
                    bgcolor: "primary.dark",
                    color: "common.white",
                  }}
                >
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" color="text.primary">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem
                  onClick={() => {
                    closeMenu();
                    navigate("/saved");
                  }}
                >
                  <ListItemIcon>
                    <BookmarkIcon fontSize="small" />
                  </ListItemIcon>
                  Saved universities
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Log out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              onClick={openAuthDialog}
            >
              Sign up
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <FilterDrawer
        handleDrawerClose={handleDrawerClose}
        drawerWidth={drawerWidth}
        open={open}
        variant={isMobile ? "temporary" : "persistent"}
      />
      <Main open={open} isMobile={isMobile}>
        <Toolbar />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            width: "100%",
          }}
        >
          {children}
          <ResultsPanel />
        </Box>
      </Main>
      <AuthDialog open={isAuthDialogOpen} onClose={closeAuthDialog} />
    </Box>
  );
}
