import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Slide,
  useScrollTrigger,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import type { NavbarProps } from '../../types';
import { BRANDING } from '../../constants';
import '../../styles/navbar/navbar.css';

interface HideOnScrollProps {
  children: React.ReactElement<unknown>;
}

const HideOnScroll = (props: HideOnScrollProps) => {
  const trigger = useScrollTrigger({ threshold: 20 });
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {props.children}
    </Slide>
  );
};

export const Navbar = (props: NavbarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const userName = props.user?.name || 'Guest User';
  const userEmail = props.user?.email || '';
  const avatarLetter = (userName.charAt(0) || 'U').toUpperCase();

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleCloseMenu();
    if (props.onLogout) {
      props.onLogout();
    }
  };

  return (
    <HideOnScroll>
      <AppBar position="sticky" elevation={0} className="navbar-appbar">
        <Toolbar variant="dense" disableGutters className="navbar-toolbar" sx={{ px: { xs: 2, md: 3 } }}>
          {/* Brand Logo: thunes with dot near s bottom-right */}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
            <Typography
              component="span"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: '1.35rem',
                letterSpacing: '-0.03em',
                color: '#0F172A',
                display: 'inline-flex',
                alignItems: 'baseline',
              }}
            >
              {BRANDING.NAME}
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: '6.5px',
                  height: '6.5px',
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  ml: '2px',
                  mb: '1px',
                }}
              />
            </Typography>
          </Box>

          {/* Right Profile & Actions with matching height */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Fully Rounded Compact Profile Pill */}
            <Box onClick={handleOpenMenu} className="navbar-profile-pill">
              <Avatar
                src={props.user?.avatarUrl}
                alt={userName}
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  color: '#FFFFFF',
                }}
              >
                {avatarLetter}
              </Avatar>

              <Box className="navbar-profile-text" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}
                >
                  {userName}
                </Typography>
                {userEmail && (
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ fontSize: '0.66rem', color: '#475569', fontWeight: 500, lineHeight: 1.1 }}
                  >
                    {userEmail}
                  </Typography>
                )}
              </Box>

              <ArrowDownIcon sx={{ fontSize: '0.9rem', color: '#64748B', flexShrink: 0 }} />
            </Box>

            {/* Fully Rounded Matching Logout Button */}
            {props.onLogout && (
              <Box component="button" onClick={handleLogoutClick} className="navbar-logout-btn">
                <LogoutIcon sx={{ fontSize: '0.9rem' }} />
                <span>Log out</span>
              </Box>
            )}

            {/* Profile Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleCloseMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 190,
                    borderRadius: '8px',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
                    border: '1px solid #E2E8F0',
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.825rem', color: '#0F172A' }}>
                  {userName}
                </Typography>
                {userEmail && (
                  <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.725rem' }}>
                    {userEmail}
                  </Typography>
                )}
              </Box>

              <MenuItem onClick={handleCloseMenu} sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <PersonIcon sx={{ fontSize: '1.05rem', color: '#64748B' }} />
                </ListItemIcon>
                <ListItemText primary="Account" primaryTypographyProps={{ fontSize: '0.8125rem' }} />
              </MenuItem>

              {props.onLogout && (
                <MenuItem onClick={handleLogoutClick} sx={{ py: 1, color: 'error.main' }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <LogoutIcon sx={{ fontSize: '1.05rem', color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Log out" primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }} />
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};
