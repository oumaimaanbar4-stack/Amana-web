import { useState } from 'react';
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

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const { data, error } = await supabase
      .from('agents')
      .select('agent_id, matricule, nom, email, created_at')
      .eq('email', email.trim())
      .eq('password', password)
      .maybeSingle();

    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (!data) {
      setErrorMsg('Invalid email or password.');
      return;
    }

    if (onLoginSuccess) {
      onLoginSuccess(data);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Agent Login (agents)
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}
          <Button type="submit" variant="contained" fullWidth disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}