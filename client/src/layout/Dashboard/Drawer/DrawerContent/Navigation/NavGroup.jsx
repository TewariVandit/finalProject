import { useState } from 'react';

import Collapse from '@mui/material/Collapse';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { useNavigate, useLocation } from 'react-router-dom';

import { useGetMenuMaster } from 'api/menu';
import { useAuth } from 'context/AuthContext';

export default function NavGroup({ item }) {
  const [openId, setOpenId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { admin } = useAuth();
  const isAdmin = admin?.role === "Admin";

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const visibleChildren = item.children
    ?.map((menuItem) => {
      if (menuItem.adminOnly && !isAdmin) return null;
      if (menuItem.children) {
        const children = menuItem.children.filter((child) => !child.adminOnly || isAdmin);
        if (!children.length) return null;
        return { ...menuItem, children };
      }
      return menuItem;
    })
    .filter(Boolean);

  const navItems = visibleChildren?.map((menuItem) => {
    if (menuItem.type === 'collapse') {
      const isChildActive = menuItem.children?.some(
        (child) => location.pathname === child.url
      );

      const isOpen = openId
        ? openId === menuItem.id
        : isChildActive;

      return (
        <Box key={menuItem.id}>
          <Tooltip title={!drawerOpen ? menuItem.title : ''} placement="right">
            <ListItemButton
              onClick={() => handleToggle(menuItem.id)}
              sx={{
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {menuItem.icon && (
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <menuItem.icon />
                </ListItemIcon>
              )}

              {drawerOpen && (
                <ListItemText primary={menuItem.title} sx={{ ml: 1 }} />
              )}

              {drawerOpen && (
                <ExpandMoreIcon
                  sx={{
                    ml: 'auto',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: '0.3s'
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>

          <Collapse in={isOpen && drawerOpen} timeout="auto" unmountOnExit>
            {menuItem.children?.map((child) => {
              const isChildActive = location.pathname === child.url;

              return (
                <ListItemButton
                  key={child.id}
                  onClick={() => {
                    setOpenId(null);
                    navigate(child.url);
                  }}
                  selected={isChildActive}
                  sx={{
                    pl: 6,
                    py: 1,
                    backgroundColor: isChildActive ? 'rgba(0,0,0,0.08)' : 'transparent',
                    borderLeft: isChildActive ? '3px solid #1976d2' : '3px solid transparent'
                  }}
                >
                  <ListItemText primary={child.title} />
                </ListItemButton>
              );
            })}
          </Collapse>
        </Box>
      );
    }

    if (menuItem.type === 'item') {
      const isActive = location.pathname === menuItem.url;

      return (
        <Tooltip
          key={menuItem.id}
          title={!drawerOpen ? menuItem.title : ''}
          placement="right"
        >
          <ListItemButton
            onClick={() => {
              setOpenId(null);
              navigate(menuItem.url);
            }}
            selected={isActive}
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isActive ? 'rgba(0,0,0,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid #1976d2' : '3px solid transparent'
            }}
          >
            {menuItem.icon && (
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <menuItem.icon />
              </ListItemIcon>
            )}

            {drawerOpen && (
              <ListItemText primary={menuItem.title} sx={{ ml: 1 }} />
            )}
          </ListItemButton>
        </Tooltip>
      );
    }

    return null;
  });

  return <List sx={{ py: 0, marginBottom: "20px" }}>{navItems}</List>;
}
