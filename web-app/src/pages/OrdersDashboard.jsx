import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { supabase } from "../lib/supabaseClient";

function WhiteAccentStatCard({ title, value, accentColor, icon }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2.25,
        bgcolor: "#ffffff",
        color: "#0f172a",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        borderBottom: `3px solid ${accentColor}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: "#64748b",
            fontWeight: 700,
            letterSpacing: 0.3,
            display: "block",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#0f172a", mt: 0.75, lineHeight: 1.1 }}
        >
          {value}
        </Typography>
      </Box>
      {icon}
    </Paper>
  );
}

export default function OrdersDashboard() {
  const [colisRows, setColisRows] = useState([]);
  const [facteursMap, setFacteursMap] = useState({});
  const [preuvesMap, setPreuvesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function loadDashboardData() {
    setErrorMsg("");

    const [colisRes, facteursRes, preuvesRes] = await Promise.all([
      supabase
        .from("colis")
        .select(
          "colis_id, code_envoi, code_secret_client, destinataire_nom, destinataire_telephone, adresse, statut, facteur_id, created_at"
        )
        .order("colis_id", { ascending: true }),
      supabase
        .from("facteurs")
        .select("facteur_id, matricule, nom, prenom"),
      supabase
        .from("preuves_livraison")
        .select("preuve_id, colis_id, statut_validation, date_livraison"),
    ]);

    if (colisRes.error) {
      setErrorMsg(colisRes.error.message);
      setLoading(false);
      return;
    }

    const fMap = {};
    if (!facteursRes.error && facteursRes.data) {
      for (const f of facteursRes.data) {
        fMap[f.facteur_id] = f;
      }
    }

    const pMap = {};
    if (!preuvesRes.error && preuvesRes.data) {
      for (const p of preuvesRes.data) {
        pMap[p.colis_id] = p;
      }
    }

    setColisRows(colisRes.data || []);
    setFacteursMap(fMap);
    setPreuvesMap(pMap);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboardData();

    const channel = supabase
      .channel("orders-dashboard-schema-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "colis" },
        () => {
          loadDashboardData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "preuves_livraison" },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleStatutChange(colisId, nextStatut) {
    const { error } = await supabase
      .from("colis")
      .update({ statut: nextStatut })
      .eq("colis_id", colisId);

    if (error) {
      setErrorMsg(`Error updating statut: ${error.message}`);
    } else {
      setColisRows((prev) =>
        prev.map((row) =>
          row.colis_id === colisId ? { ...row, statut: nextStatut } : row
        )
      );
    }
  }

  if (loading) {
    return <Typography>Loading colis...</Typography>;
  }

  if (errorMsg) {
    return <Alert severity="error">Error loading colis: {errorMsg}</Alert>;
  }

  const totalParcels = colisRows.length;
  const enCoursCount = colisRows.filter((r) => r.statut === "EN_COURS").length;
  const livreCount = colisRows.filter((r) => r.statut === "LIVRE").length;

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100%" }}>
      {/* Page Title */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#0f172a", letterSpacing: -0.2 }}
        >
          Parcels Overview
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25 }}>
          Real-time tracking synced with <strong>colis</strong>,{" "}
          <strong>facteurs</strong>, and <strong>preuves_livraison</strong>
        </Typography>
      </Box>

      {/* White Summary Cards with Colored Bottom Borders */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 2.5,
        }}
      >
        <WhiteAccentStatCard
          title="Total Parcels"
          value={totalParcels}
          accentColor="#ff6d00"
          icon={
            <SendIcon
              sx={{ fontSize: 28, color: "#ff6d00", transform: "rotate(-45deg)" }}
            />
          }
        />
        <WhiteAccentStatCard
          title="EN_COURS"
          value={enCoursCount}
          accentColor="#f59e0b"
          icon={<LocalShippingIcon sx={{ fontSize: 30, color: "#f59e0b" }} />}
        />
        <WhiteAccentStatCard
          title="LIVRE"
          value={livreCount}
          accentColor="#22c55e"
          icon={<Inventory2Icon sx={{ fontSize: 30, color: "#22c55e" }} />}
        />
      </Box>

      {/* Light Table Card Compatible with Schema */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
          bgcolor: "#ffffff",
          border: "1px solid #e2e8f0",
        }}
      >
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "#f8fafc",
                  "& th": {
                    color: "#334155",
                    fontWeight: 700,
                    fontSize: 12.5,
                    whiteSpace: "nowrap",
                    py: 1.5,
                    borderBottom: "1px solid #e2e8f0",
                  },
                }}
              >
                <TableCell>colis_id</TableCell>
                <TableCell>code_envoi</TableCell>
                <TableCell>destinataire_nom</TableCell>
                <TableCell>destinataire_telephone</TableCell>
                <TableCell>adresse</TableCell>
                <TableCell>statut</TableCell>
                <TableCell>facteur</TableCell>
                <TableCell>preuve</TableCell>
                <TableCell>Changer statut</TableCell>
                <TableCell align="right">Détails</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {colisRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    align="center"
                    sx={{ py: 4, color: "#64748b" }}
                  >
                    Aucun colis trouvé dans la table <strong>colis</strong>.
                  </TableCell>
                </TableRow>
              ) : (
                colisRows.map((row) => {
                  const chipColor =
                    row.statut === "LIVRE"
                      ? "success"
                      : row.statut === "EN_COURS"
                        ? "warning"
                        : "default";

                  const facteur = row.facteur_id ? facteursMap[row.facteur_id] : null;
                  const preuve = preuvesMap[row.colis_id] || null;

                  return (
                    <TableRow key={row.colis_id} hover>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        #{row.colis_id}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.code_envoi}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.destinataire_nom}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.destinataire_telephone || "-"}
                      </TableCell>
                      <TableCell>{row.adresse || "-"}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Chip
                          label={row.statut || "UNKNOWN"}
                          color={chipColor}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {facteur
                          ? `${facteur.prenom || ""} ${facteur.nom || ""}`.trim() ||
                          `#${row.facteur_id}`
                          : row.facteur_id
                            ? `#${row.facteur_id}`
                            : "-"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {preuve ? preuve.statut_validation || "ENREGISTREE" : "Aucune"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={row.statut || "EN_COURS"}
                            onChange={(e) =>
                              handleStatutChange(row.colis_id, e.target.value)
                            }
                          >
                            <MenuItem value="EN_COURS">EN_COURS</MenuItem>
                            <MenuItem value="LIVRE">LIVRE</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Button
                          component={Link}
                          to={`/orders/${row.colis_id}`}
                          size="small"
                          variant="contained"
                          sx={{
                            textTransform: "none",
                            bgcolor: "#1a237e",
                            "&:hover": { bgcolor: "#0d47a1" },
                          }}
                        >
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}