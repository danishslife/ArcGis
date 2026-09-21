import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";
import { useSavedUniversities } from "../useContext/savedUniversitiesContext";

export default function ResultsPanel() {
  const { areaResults, setAreaResults, isSearching } =
    useCollegesUniversities();
  const { isSaved, isPending, toggleSave } = useSavedUniversities();

  if (!isSearching && !areaResults) {
    return null;
  }

  const institutions = areaResults?.institutions ?? [];
  const total = areaResults?.total ?? 0;
  const isCapped = total > institutions.length;

  return (
    <Paper
      elevation={8}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        bottom: 16,
        zIndex: 1,
        width: { xs: "calc(100% - 32px)", sm: 380 },
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 2,
          py: 1.5,
        }}
      >
        <Box>
          <Typography variant="subtitle1" color="text.primary">
            Universities in area
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isSearching
              ? "Searching..."
              : isCapped
                ? `Showing first ${institutions.length.toLocaleString()} of ${total.toLocaleString()}`
                : `${total.toLocaleString()} found`}
          </Typography>
        </Box>

        <IconButton
          onClick={() => setAreaResults(null)}
          aria-label="close results"
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      {isSearching ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : institutions.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No universities fall inside the shape you drew.
          </Typography>
        </Box>
      ) : (
        <List dense sx={{ overflowY: "auto", flex: 1, py: 0 }}>
          {institutions.map((institution) => (
            <ListItem
              key={institution.uniId}
              divider
              sx={{ display: "flex", alignItems: "flex-start", gap: 1, py: 1.25 }}
              secondaryAction={
                <Tooltip
                  title={
                    isSaved(institution.uniId)
                      ? "Remove from saved"
                      : "Save university"
                  }
                >
                  <span>
                    <IconButton
                      edge="end"
                      size="small"
                      disabled={isPending(institution.uniId)}
                      onClick={() => toggleSave(institution)}
                      aria-label={
                        isSaved(institution.uniId)
                          ? `Remove ${institution.name} from saved`
                          : `Save ${institution.name}`
                      }
                      sx={{ color: isSaved(institution.uniId) ? "error.main" : "action.active" }}
                    >
                      {isSaved(institution.uniId) ? (
                        <FavoriteIcon fontSize="small" />
                      ) : (
                        <FavoriteBorderIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              }
            >
              <Box sx={{ minWidth: 0, pr: 4 }}>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ fontWeight: 600 }}
              >
                {institution.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {institution.city}, {institution.state}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {institution.address}
              </Typography>
              {institution.website ? (
                <Link
                  href={institution.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="caption"
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
    </Paper>
  );
}
