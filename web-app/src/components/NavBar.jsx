import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Person from "@mui/icons-material/Person";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";

const NavBar = ({ user, drawerWidth = 240, onToggleDrawer, onLogout }) => {
  const navigate = useNavigate();
  const [avatarAnchor, setAvatarAnchor] = useState(null);
  const openAvatar = Boolean(avatarAnchor);

  const displayName = user?.nom || user?.name || "Oumaima";
  const displayRole = user?.role || (user?.agent_id ? "agent" : "admin");

  const handleAvatarOpen = (event) => {
    setAvatarAnchor(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAvatarAnchor(null);
  };

  const handleLogout = () => {
    handleAvatarClose();
    localStorage.removeItem("token");
    localStorage.removeItem("amana_agent");
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        backgroundColor: "#ffffff",
        color: "#333333",
        borderBottom: "1px solid #e2e8f0",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
        {/* Left: Mobile Drawer Button + User Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={onToggleDrawer}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: "bold", display: "block", color: "#1e293b" }}
            >
              Bienvenue: {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Profil: {displayRole}
            </Typography>
          </Box>
        </Box>

        {/* Center Logo */}
        <Box
          onClick={() => navigate("/orders")}
          sx={{
            cursor: "pointer",
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.05)" },
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="/photo/amana.jpeg"
            alt="Logo"
            style={{ height: "40px", objectFit: "contain" }}
          />
        </Box>

        {/* Right: Avatar + Profile/Settings/Logout */}
        <Box>
          <IconButton onClick={handleAvatarOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: "#1a237e", width: 34, height: 34, fontSize: 14 }}>
              {displayName.charAt(0).toUpperCase() || "A"}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={avatarAnchor}
            open={openAvatar}
            onClose={handleAvatarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              elevation: 4,
              sx: {
                mt: 1.5,
                borderRadius: "12px",
                minWidth: 200,
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleAvatarClose();
                navigate("/login");
              }}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleAvatarClose();
                navigate("/orders");
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;