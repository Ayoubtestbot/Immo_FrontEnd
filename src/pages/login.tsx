import { useState, useEffect } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.query.registered === 'true') {
      setRegisteredSuccess(true);
      // Remove the query parameter after showing the message
      router.replace('/login', undefined, { shallow: true });
    }
  }, [router.query.registered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegisteredSuccess(false); // Clear success message on new login attempt

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.ok) {
      // Fetch session to get user role
      const session = await getSession();
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/agency/dashboard');
      }
    } else {
      setError(result?.error || 'Email ou mot de passe invalide');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Connexion</h2>
          {registeredSuccess && (
            <Alert variant="success">
              Inscription réussie ! Vous pouvez maintenant vous connecter.
            </Alert>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
            <p className="text-center mt-3">
              Pas encore de compte ? <a href="/register">Inscrivez-vous ici</a>
            </p>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;
