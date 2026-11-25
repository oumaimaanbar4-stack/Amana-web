import { Chip } from '@mui/material';

export default function StatusBadge({ value, fallback = 'UNKNOWN' }) {
  const status = value || fallback;

  const colorMap = {
    EN_COURS: 'warning',
    LIVRE: 'success',
    EN_ATTENTE: 'warning',
    VALIDE: 'success',
    REJETE: 'error',
  };

  return (
    <Chip
      label={status}
      color={colorMap[status] || 'default'}
      size="small"
    />
  );
}