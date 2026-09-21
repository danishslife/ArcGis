import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useSavedUniversities } from "../useContext/savedUniversitiesContext";

export default function SavedUniversities() {
  const navigate = useNavigate();
  const { saved, isLoading, error, isPending, unsave } = useSavedUniversities();

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        bgcolor: "background.paper",
        overflowY: "auto",
        p: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" color="text.primary">
            Saved Universities
          </Typography>
          {!isLoading && saved.length > 0 ? (
            <Typography variant="caption" color="text.secondary">
              {saved.length.toLocaleString()} saved
            </Typography>
          ) : null}
        </Box>

        <IconButton onClick={() => navigate("/")} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : saved.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          Nothing saved yet. Draw a shape on the map, then tap the heart next to
          a university to save it here.
        </Typography>
      ) : (
        <List sx={{ width: "100%" }}>
          {saved.map((university) => (
            <ListItem
              key={university.uniId}
              divider
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                py: 1.5,
              }}
              secondaryAction={
                <Tooltip title="Remove from saved">
                  <span>
                    <IconButton
                      edge="end"
                      aria-label={`Remove ${university.name} from saved`}
                      disabled={isPending(university.uniId)}
                      onClick={() => unsave(university.uniId)}
                      sx={{ color: "error.main" }}
                    >
                      <FavoriteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              }
            >
              <Box sx={{ minWidth: 0, pr: 4 }}>
                <Typography
                  variant="body1"
                  color="text.primary"
                  sx={{ fontWeight: 600 }}
                >
                  {university.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  {university.city}, {university.state}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  {university.address}
                </Typography>
                {university.website ? (
                  <Link
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    underline="hover"
                  >
                    Visit website
                  </Link>
                ) : null}
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
