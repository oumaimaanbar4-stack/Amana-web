import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import { getDeadlineInfo } from '../utils/deadline';
import StatusBadge from './StatusBadge';

export default function ProofGallery({ colis_id, onProofLoaded }) {
  const [preuve, setPreuve] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProofs() {
      if (!colis_id) return;
      setLoading(true);
      setErrorMsg('');

      const { data: proofRow, error: proofError } = await supabase
        .from('preuves_livraison')
        .select(
          'preuve_id, colis_id, date_livraison, date_limite_modification, statut_validation'
        )
        .eq('colis_id', colis_id)
        .maybeSingle();

      if (!active) return;

      if (proofError) {
        setErrorMsg(proofError.message);
        setPreuve(null);
        setPhotos([]);
        setLoading(false);
        return;
      }

      setPreuve(proofRow || null);
      if (onProofLoaded) onProofLoaded(proofRow || null);

      if (!proofRow) {
        setPhotos([]);
        setLoading(false);
        return;
      }

      const { data: photoRows, error: photosError } = await supabase
        .from('photos_preuve')
        .select('photo_id, preuve_id, photo_url, created_at')
        .eq('preuve_id', proofRow.preuve_id)
        .order('photo_id', { ascending: true });

      if (!active) return;

      if (photosError) {
        setErrorMsg(photosError.message);
        setPhotos([]);
      } else {
        setPhotos(photoRows || []);
      }

      setLoading(false);
    }

    loadProofs();

    return () => {
      active = false;
    };
  }, [colis_id, onProofLoaded]);

  if (loading) {
    return <Typography variant="body2">Loading delivery proof...</Typography>;
  }

  if (errorMsg) {
    return (
      <Alert severity="info">
        <strong>preuves_livraison / photos_preuve:</strong> {errorMsg}
      </Alert>
    );
  }

  if (!preuve) {
    return (
      <Alert severity="info">
        No delivery proof recorded yet for this parcel.
      </Alert>
    );
  }

  const deadline = getDeadlineInfo(
    preuve.date_limite_modification,
    preuve.date_livraison
  );

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>preuve_id:</strong> {preuve.preuve_id}
      </Typography>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" component="span">
          <strong>statut_validation:</strong>
        </Typography>
        <StatusBadge value={preuve.statut_validation} />
      </Box>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>date_livraison:</strong>{' '}
        {new Date(preuve.date_livraison).toLocaleString()}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        <strong>date_limite_modification:</strong>{' '}
        {new Date(preuve.date_limite_modification).toLocaleString()} (
        {deadline.label}
        {deadline.isOpen ? ` — ${deadline.remainingText}` : ''})
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        photos_preuve ({photos.length} / 3)
      </Typography>

      {photos.length === 0 ? (
        <Typography variant="body2">No proof photos uploaded yet.</Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
          }}
        >
          {photos.slice(0, 3).map((photo, index) => (
            <Card key={photo.photo_id} variant="outlined">
              <CardMedia
                component="img"
                height="160"
                image={photo.photo_url}
                alt={`Proof photo ${index + 1}`}
              />
              <CardContent>
                <Typography variant="subtitle2">
                  Photo #{index + 1}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  photo_id: {photo.photo_id}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}