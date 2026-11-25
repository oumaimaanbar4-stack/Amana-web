import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import StatusBadge from '../components/StatusBadge';

export default function ClientQrVerify() {
  const { colisId } = useParams();
  const [colis, setColis] = useState(null);
  const [secretInput, setSecretInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchColis() {
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
        setMessage(`Parcel not found (${error.message}).`);
      } else {
        setColis(data);
      }
      setLoading(false);
    }

    fetchColis();
  }, [colisId]);

  async function handleVerify(e) {
    e.preventDefault();
    setMessage('');
    if (!colis) return;

    if (secretInput.trim() !== String(colis.code_secret_client).trim()) {
      setMessage('Incorrect code_secret_client.');
      return;
    }

    const { error } = await supabase
      .from('colis')
      .update({ statut: 'LIVRE' })
      .eq('colis_id', colis.colis_id);

    if (error) {
      setMessage(`Error updating statut: ${error.message}`);
    } else {
      setColis({ ...colis, statut: 'LIVRE' });
      setMessage('Parcel status updated to LIVRE.');
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography>Loading parcel...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Parcel Verification
        </Typography>

        {colis ? (
          <>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>code_envoi:</strong> {colis.code_envoi}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>destinataire_nom:</strong> {colis.destinataire_nom}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>adresse:</strong> {colis.adresse}
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" component="span">
                <strong>statut:</strong>
              </Typography>
              <StatusBadge value={colis.statut} />
            </Box>

            <Box component="form" onSubmit={handleVerify}>
              <TextField
                fullWidth
                label="code_secret_client"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="e.g. 4829"
                required
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained">
                Verify
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="body2">
            Parcel not found. Please check the QR code or the parcel ID.
          </Typography>
        )}

        {message && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
      </Paper>
    </Container>
  );
}