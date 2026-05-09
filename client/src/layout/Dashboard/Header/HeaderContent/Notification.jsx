import { useRef, useState, useEffect } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

// icons
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

// API
import API from '../../../../api/axios';

const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

export default function Notification() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const anchorRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 🔹 Toggle
  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  // 🔹 Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { data } = await API.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Fetch notifications
  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      const { data } = await API.get(
        `/notifications?page=${pageNum}&limit=5`
      );

      if (append) {
        setNotifications((prev) => [...prev, ...data.data]);
      } else {
        setNotifications(data.data);
      }

      setHasMore(pageNum < data.pagination.pages);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Mark all read
  const handleMarkAllRead = async () => {
    try {
      await API.patch('/notifications/mark-all-read');

      setUnreadCount(0);

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Mark single read
  const handleReadOne = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Load more (View All)
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  // 🔹 On open → fetch data
  useEffect(() => {
    if (open) {
      fetchNotifications(1);
      setPage(1);
    }
  }, [open]);

  // 🔹 Load unread count initially
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // 🔹 Icon mapper
  const getIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageOutlined />;
      case 'alert':
        return <GiftOutlined />;
      case 'system':
      default:
        return <SettingOutlined />;
    }
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      {/* 🔔 Bell */}
      <IconButton
        color="secondary"
        variant="light"
        ref={anchorRef}
        onClick={handleToggle}
      >
        <Badge badgeContent={unreadCount} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>

      {/* 🔽 Dropdown */}
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        transition
      >
        {({ TransitionProps }) => (
          <Transitions in={open} {...TransitionProps}>
            <Paper sx={{ width: 350 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notification"
                  content={false}
                  secondary={
                    unreadCount > 0 && (
                      <Tooltip title="Mark all read">
                        <IconButton
                          size="small"
                          onClick={handleMarkAllRead}
                        >
                          <CheckCircleOutlined />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <List
                    sx={{
                      maxHeight: 400,
                      overflowY: 'auto'
                    }}
                  >

                    {
                      notifications.length > 0 ? (
                        <>
                          {notifications.map((item) => (
                            <ListItem key={item._id} disablePadding>
                              <ListItemButton
                                selected={!item.isRead}
                                onClick={() => handleReadOne(item._id)}
                              >
                                <ListItemAvatar>
                                  <Avatar>{getIcon(item.type)}</Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                  primary={item.title}
                                  secondary={item.message}
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}

                          {/* 🔽 Load More */}
                          {hasMore && (
                            <ListItemButton onClick={loadMore}>
                              <ListItemText
                                primary={
                                  <Typography color="primary" align="center">
                                    View More
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          )}
                        </>
                      ) : (
                        <p style={{ textAlign: "center" }}>
                          No notification found
                        </p>
                      )
                    }
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}