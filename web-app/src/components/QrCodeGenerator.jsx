import { Box, Paper, Typography } from '@mui/material';

export default function QrCodeGenerator({ colis_id, code_envoi }) {
  if (!colis_id) return null;

  const verifyUrl = `${window.location.origin}/colis/${colis_id}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    verifyUrl
  )}`;

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2, display: 'inline-block' }}>
      <Typography variant="subtitle2" gutterBottom>
        QR Code ({code_envoi || `colis_id: ${colis_id}`})
      </Typography>
      <Box
        component="img"
        src={qrImageUrl}
        alt={`QR code for parcel ${code_envoi || colis_id}`}
        sx={{ width: 160, height: 160, display: 'block' }}
      />
      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
        {verifyUrl}
      </Typography>
    </Paper>
  );
}