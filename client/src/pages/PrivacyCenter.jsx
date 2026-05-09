import { Typography, Paper, Stack } from "@mui/material";
import MainCard from "components/MainCard";

export default function PrivacyCenter() {
  return (
    <MainCard>
      <Typography variant="h5" mb={2}>
        Privacy Policy
      </Typography>

      <Paper sx={{ p: 3, maxHeight: 600, overflow: "auto" }}>
        <Stack spacing={2}>

          <Typography variant="h6">1. Introduction</Typography>
          <Typography>
            We value your privacy and ensure your data is protected.
          </Typography>

          <Typography variant="h6">2. Data Collection</Typography>
          <Typography>
            We collect user data such as name, email, and usage activity.
          </Typography>

          <Typography variant="h6">3. Data Usage</Typography>
          <Typography>
            Data is used to improve services and provide better experience.
          </Typography>

          <Typography variant="h6">4. Security</Typography>
          <Typography>
            We implement strict security measures to protect your data.
          </Typography>

          <Typography variant="h6">5. User Rights</Typography>
          <Typography>
            Users can request deletion or modification of their data.
          </Typography>

          <Typography variant="h6">6. Contact</Typography>
          <Typography>
            For privacy concerns, contact support@company.com
          </Typography>

        </Stack>
      </Paper>
    </MainCard>
  );
}