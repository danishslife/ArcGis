import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useAuth } from "../useContext/authContext";

type AuthDialogProps = {
  open: boolean;
  onClose: () => void;
};

type Mode = "signup" | "login";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export default function AuthDialog({ open, onClose }: AuthDialogProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("signup");
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const setField = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const resetAndClose = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setMode("signup");
    onClose();
  };

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await register(
          form.email,
          form.password,
          form.firstName,
          form.lastName,
        );
      } else {
        await login(form.email, form.password);
      }
      resetAndClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : resetAndClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(0, 0, 0, 0.35)",
          },
        },
        paper: { sx: { borderRadius: 3 } },
      }}
    >
      <DialogTitle sx={{ pb: 1, color: "text.primary" }}>
        {isSignup ? "Create an account" : "Welcome back"}
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            {isSignup ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1}}>
                <TextField
                  label="First name"
                  value={form.firstName}
                  onChange={(event) =>
                    setField("firstName", event.target.value)
                  }
                  required
                  fullWidth
                  autoFocus
                />
                <TextField
                  label="Last name"
                  value={form.lastName}
                  onChange={(event) => setField("lastName", event.target.value)}
                  required
                  fullWidth
                />
              </Stack>
            ) : null}

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              required
              fullWidth
              autoFocus={!isSignup}
              autoComplete="email"
            />

            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => setField("password", event.target.value)}
              required
              fullWidth
              autoComplete={isSignup ? "new-password" : "current-password"}
              helperText={isSignup ? "At least 8 characters" : undefined}
              slotProps={{ htmlInput: { minLength: isSignup ? 8 : undefined } }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
            >
              {isSignup ? "Sign up" : "Log in"}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
              {isSignup ? "Already have an account? " : "New here? "}
              <Link
                component="button"
                type="button"
                onClick={switchMode}
                underline="hover"
              >
                {isSignup ? "Log in" : "Create one"}
              </Link>
            </Typography>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
