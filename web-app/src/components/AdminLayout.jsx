import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import BarChart from "@mui/icons-material/BarChart";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Inventory2 from "@mui/icons-material/Inventory2";
import EditNote from "@mui/icons-material/EditNote";
import Groups from "@mui/icons-material/Groups";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import NavBar from "./NavBar";

const drawerWidth = 250;
const collapsedDrawerWidth = 76;

const sidebarItems = [
  
  { key: "envois", label: "liste Colis", to: "/orders", icon: <LocalShipping /> },
  { key: "preuves", label: "Preuves et Modifications", to: "/orders/1", icon: <EditNote /> },
  { key: "facteurs", label: "Facteurs", to: "/orders", icon: <Groups /> },
  { key: "login", label: "Connexion Agent", to: "/login", icon: <AdminPanelSettings /> },
];

export default function AdminLayout({ children, user, onLogout }) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState("envois");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isSidebarExpanded = isMobile ? true : desktopOpen;
  const activeDrawerWidth = isMobile
    ? drawerWidth
    : desktopOpen
      ? drawerWidth
      : collapsedDrawerWidth;

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setDesktopOpen((prev) => !prev);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedKey(item.key);
    navigate(item.to);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        color: "#1e293b",
        overflowX: "hidden",
      }}
    >
      {/* Header: Menu Icon + Title (never cut off when collapsed) */}
      <Box
        sx={{
          px: isSidebarExpanded ? 2 : 0.5,
          py: 1.25,
          minHeight: 64,
          borderBottom: "1px solid #e2e8f0",
          bgcolor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: isSidebarExpanded ? "flex-start" : "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: isSidebarExpanded ? "row" : "column",
            alignItems: "center",
            gap: isSidebarExpanded ? 1 : 0.15,
          }}
        >
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={handleToggleSidebar}
            size="small"
            sx={{ color: "#1a237e", p: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant={isSidebarExpanded ? "subtitle1" : "caption"}
            sx={{
              fontWeight: 700,
              color: "#1a237e",
              letterSpacing: isSidebarExpanded ? 0.3 : 0.4,
              lineHeight: 1.15,
              fontSize: isSidebarExpanded ? 15 : 10,
              whiteSpace: "nowrap",
            }}
          >
            {isSidebarExpanded ? "AMANA DELIVERY" : "AMANA"}
          </Typography>
        </Box>

        {isSidebarExpanded && (
          <Typography
            variant="caption"
            sx={{ color: "#64748b", lineHeight: 1.2, pl: 4.25 }}
          >
            Back-Office &amp; Livraison
          </Typography>
        )}
      </Box>

      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {sidebarItems.map((item) => {
          const isActive = selectedKey === item.key;

          return (
            <Tooltip
              key={item.key}
              title={!isSidebarExpanded ? item.label : ""}
              placement="right"
            >
              <ListItemButton
                selected={isActive}
                onClick={() => handleSelectItem(item)}
                sx={{
                  mb: 0.5,
                  borderRadius: "8px",
                  justifyContent: isSidebarExpanded ? "flex-start" : "center",
                  px: isSidebarExpanded ? 1.5 : 1,
                  color: isActive ? "#1a237e" : "#475569",
                  bgcolor: isActive ? "rgba(255, 109, 0, 0.12)" : "transparent",
                  borderLeft: isActive
                    ? "3px solid #ff6d00"
                    : "3px solid transparent",
                  "&.Mui-selected": {
                    bgcolor: "rgba(255, 109, 0, 0.12)",
                    "&:hover": {
                      bgcolor: "rgba(255, 109, 0, 0.16)",
                    },
                  },
                  "&:hover": {
                    bgcolor: isActive ? "rgba(255, 109, 0, 0.16)" : "#f1f5f9",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#ff6d00" : "#64748b",
                    minWidth: isSidebarExpanded ? 36 : 0,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {isSidebarExpanded && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 13.5,
                      fontWeight: isActive ? 700 : 500,
                      noWrap: true,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box
        sx={{
          p: isSidebarExpanded ? 2 : 1,
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#f8f9fa",
          textAlign: isSidebarExpanded ? "left" : "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#64748b",
            display: "block",
            fontSize: isSidebarExpanded ? 12 : 10,
          }}
        >
          {isSidebarExpanded ? (
            <>
              Table active: <strong>colis</strong>
            </>
          ) : (
            <strong>colis</strong>
          )}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <NavBar
        user={user}
        drawerWidth={isMobile ? 0 : activeDrawerWidth}
        onToggleDrawer={handleToggleSidebar}
        onLogout={onLogout}
      />

      <Box
        component="nav"
        sx={{
          width: { md: `${activeDrawerWidth}px` },
          flexShrink: { md: 0 },
          transition: "width 0.2s ease",
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: activeDrawerWidth,
                borderRight: "1px solid #e2e8f0",
                transition: "width 0.2s ease",
                overflowX: "hidden",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${activeDrawerWidth}px)` },
          mt: "64px",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)",
          transition: "width 0.2s ease",
        }}
      >
        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          {children}
        </Box>

        <Box
          component="footer"
          sx={{
            px: 3,
            py: 1,
            bgcolor: "#ff6d00",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
          }}
        >
          <Box sx={{ display: "flex", gap: 2.5 }}>
            <span>© 2026 Amana-Track</span>
            <span>Conditions</span>
            <span>Sécurité et Confidentialité</span>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            AMANA
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}