import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

const NewAgencyPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      setName(router.query.name as string || '');
      setEmail(router.query.email as string || '');
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding/new-agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyName }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to create agency');
      }

      setLoading(false);
      router.push('/agency/dashboard');
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '500px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Créer votre agence</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Votre Nom</Form.Label>
              <Form.Control type="text" value={name} disabled />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} disabled />
            </Form.Group>
            <Form.Group className="mb-3" controlId="agencyName">
              <Form.Label>Nom de votre Agence</Form.Label>
              <Form.Control type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Création en cours...' : 'Créer l\'agence'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NewAgencyPage;
