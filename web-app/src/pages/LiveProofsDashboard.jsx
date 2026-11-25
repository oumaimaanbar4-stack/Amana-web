import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function LiveProofsDashboard() {
  const [colisList, setColisList] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  async function fetchAllData() {
    setErrorMsg('');
    const [colisRes, proofsRes, photosRes] = await Promise.all([
      supabase.from('colis').select('*').order('colis_id', { ascending: false }),
      supabase.from('delivery_proofs').select('*'),
      supabase.from('proof_photos').select('*'),
    ]);

    if (colisRes.error || proofsRes.error || photosRes.error) {
      setErrorMsg(
        colisRes.error?.message ||
          proofsRes.error?.message ||
          photosRes.error?.message ||
          'Error loading dashboard data'
      );
    } else {
      setColisList(colisRes.data || []);
      setProofs(proofsRes.data || []);
      setPhotos(photosRes.data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAllData();

    const channel = supabase
      .channel('live-proofs-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_proofs' }, () => {
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proof_photos' }, () => {
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'colis' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <p>Loading live proof monitor...</p>;
  if (errorMsg) return <p>Error: {errorMsg}</p>;

  return (
    <div>
      <h3>Live Proof Control & Parcel Status</h3>
      <p>Updates automatically when new proofs or photos arrive in Supabase.</p>

      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Parcel ID</th>
            <th>Tracking / Recipient</th>
            <th>Proof Status</th>
            <th>Photos Sent</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {colisList.map((item) => {
            const idKey = item.colis_id ?? item.id;
            const matchingProofs = proofs.filter(
              (p) => String(p.colis_id ?? p.order_id ?? p.parcel_id) === String(idKey)
            );
            const latestProof = matchingProofs[matchingProofs.length - 1];
            const proofPhotos = latestProof
              ? photos.filter((ph) => String(ph.proof_id) === String(latestProof.id))
              : [];

            return (
              <tr key={idKey}>
                <td>{idKey}</td>
                <td>{item.destinataire_nom || item.code_envoi || '—'}</td>
                <td>{latestProof ? 'Proof Received' : 'Waiting for Courier'}</td>
                <td>{proofPhotos.length} / 3 photos</td>
                <td>
                  <Link to={`/colis/${idKey}`}>Inspect Proof</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}