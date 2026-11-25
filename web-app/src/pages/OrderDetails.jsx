import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import QrCodeGenerator from '../components/QrCodeGenerator';
import ProofGallery from '../components/ProofGallery';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetails() {
  const { colisId } = useParams();
  const [colis, setColis] = useState(null);
  const [preuve, setPreuve] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    async function loadOrder() {
      if (!colisId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('colis')
        .select(
          'colis_id, code_envoi, code_secret_client, destinataire_nom, destinataire_telephone, adresse, statut, facteur_id, created_at'
        )
        .eq('colis_id', colisId)
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else {
        setColis(data);
      }
      setLoading(false);
    }

    loadOrder();
  }, [colisId]);

  const handleProofLoaded = useCallback((proofRow) => {
    setPreuve(proofRow);
  }, []);

  async function handleValidationUpdate(nextStatutValidation) {
    if (!preuve?.preuve_id) return;
    setActionMsg('');

    const { error } = await supabase
      .from('preuves_livraison')
      .update({ statut_validation: nextStatutValidation })
      .eq('preuve_id', preuve.preuve_id);

    if (error) {
      setActionMsg(`Could not update statut_validation: ${error.message}`);
    } else {
      setPreuve({ ...preuve, statut_validation: nextStatutValidation });
      setActionMsg(`statut_validation set to ${nextStatutValidation}.`);
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading parcel details...</Typography>
      </Container>
    );
  }

  if (errorMsg) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Error: {errorMsg}</Alert>
      </Container>
    );
  }

  if (!colis) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Parcel not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
      <Button component={Link} to="/orders" variant="text" sx={{ mb: 2 }}>
        Back to OrdersDashboard
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Parcel Details — {colis.code_envoi}
        </Typography>

        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>colis_id:</strong> {colis.colis_id}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>code_envoi:</strong> {colis.code_envoi}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>destinataire_nom:</strong> {colis.destinataire_nom}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>destinataire_telephone:</strong> {colis.destinataire_telephone}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>adresse:</strong> {colis.adresse}
        </Typography>
        <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" component="span">
            <strong>statut:</strong>
          </Typography>
          <StatusBadge value={colis.statut} />
        </Box>
        <Typography variant="body2">
          <strong>facteur_id:</strong> {colis.facteur_id}
        </Typography>

        <QrCodeGenerator colis_id={colis.colis_id} code_envoi={colis.code_envoi} />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Delivery Proof &amp; Photos
        </Typography>

        {preuve && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => handleValidationUpdate('VALIDE')}
            >
              VALIDE
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => handleValidationUpdate('REJETE')}
            >
              REJETE
            </Button>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => handleValidationUpdate('EN_ATTENTE')}
            >
              EN_ATTENTE
            </Button>
          </Box>
        )}

        {actionMsg && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {actionMsg}
          </Alert>
        )}

        <ProofGallery colis_id={colis.colis_id} onProofLoaded={handleProofLoaded} />
      </Paper>
    </Container>
  );
}