import { useEffect, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export default function GlobalApiLoader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer;

    const handleLoading = (event) => {
      if (event.detail.loading) {
        timer = setTimeout(() => setLoading(true), 150);
      } else {
        clearTimeout(timer);
        setLoading(false);
      }
    };

    window.addEventListener("api-loading", handleLoading);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("api-loading", handleLoading);
    };
  }, []);

  return (
    <Backdrop
      open={loading}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.modal + 2000,
        bgcolor: "rgba(17, 24, 39, 0.45)",
        backdropFilter: "blur(2px)"
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress color="inherit" />
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Please wait...
        </Typography>
      </Box>
    </Backdrop>
  );
}
