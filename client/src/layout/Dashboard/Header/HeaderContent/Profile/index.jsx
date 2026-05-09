import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router-dom";

// project imports
import ProfileTab from './ProfileTab';
import SettingTab from './SettingTab';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import IconButton from 'components/@extended/IconButton';
import { useAuth } from "../../../../../context/AuthContext";
import { getAssetUrl } from "utils/assetUrl";

// assets
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// tab panel wrapper
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && children}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`
  };
}

// ==============================|| HEADER PROFILE ||============================== //

export default function Profile() {
  const theme = useTheme();
  const { admin, logout } = useAuth(); // ✅ from context
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
  };
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen((prev) => !prev);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => setValue(newValue);

  return (
    <Box sx={{ flexShrink: 0, ml: 'auto' }}>
      <Tooltip title="Profile" disableInteractive>
        <ButtonBase
          sx={(theme) => ({
            p: 0.25,
            borderRadius: 1,
            '&:focus-visible': {
              outline: `2px solid ${theme.vars.palette.secondary.dark}`,
              outlineOffset: 2
            }
          })}
          ref={anchorRef}
          onClick={handleToggle}
        >
          <Avatar
            alt="profile user"
            src={getAssetUrl(admin?.image)}
            size="sm"
            sx={{ '&:hover': { outline: '1px solid', outlineColor: 'primary.main' } }}
          >
            {!admin?.image && admin?.fullName?.charAt(0)}
          </Avatar>
        </ButtonBase>
      </Tooltip>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({
              boxShadow: theme.vars.customShadows.z1,
              width: 290
            })}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>

                  {/* ===== Header ===== */}
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid container justifyContent="space-between" alignItems="center">

                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={getAssetUrl(admin?.image)}
                          sx={{ width: 32, height: 32 }}
                        >
                          {!admin?.image && admin?.fullName?.charAt(0)}
                        </Avatar>

                        <Stack>
                          <Typography variant="h6">
                            {admin?.fullName || "Admin"}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {admin?.email}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* ✅ Logout */}
                      <Tooltip title="Logout">
                        <IconButton size="large" onClick={handleLogout}>
                          <LogoutOutlined />
                        </IconButton>
                      </Tooltip>

                    </Grid>
                  </CardContent>

                  {/* ===== Tabs ===== */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} variant="fullWidth">
                      <Tab icon={<UserOutlined />} label="Profile" {...a11yProps(0)} />
                      <Tab icon={<SettingOutlined />} label="Setting" {...a11yProps(1)} />
                    </Tabs>
                  </Box>

                  <TabPanel value={value} index={0}>
                    <ProfileTab />
                  </TabPanel>

                  <TabPanel value={value} index={1}>
                    <SettingTab />
                  </TabPanel>

                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number,
  index: PropTypes.number
};
