import {
  Box, Typography, Grid, TextField, Button, Paper
} from "@mui/material";
import MainCard from "components/MainCard";

export default function SupportCenter() {

  return (
    <MainCard>
      <Typography variant="h5" mb={2}>
        Support Center
      </Typography>

      <Grid container spacing={3}>

        {/* INFO */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Need Help?</Typography>
            <Typography variant="body2" mt={1}>
              Submit your issue and our team will respond quickly.
            </Typography>
          </Paper>
        </Grid>

        {/* FORM */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Raise a Ticket
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Name" />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Email" />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Subject" />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message"
                />
              </Grid>
            </Grid>

            <Button variant="contained" sx={{ mt: 2 }}>
              Submit Ticket
            </Button>
          </Paper>
        </Grid>

      </Grid>
    </MainCard>
  );
}