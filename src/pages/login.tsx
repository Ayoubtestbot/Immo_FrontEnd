import { useState, useEffect } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from 'next/link';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
// Removed GetServerSidePropsContext, getServerSession, authOptions imports

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

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const res = await signIn('firebase', { idToken, redirect: false });

      if (res?.ok) {
        const session = await getSession();
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (session?.user?.agencyId) {
          router.push('/agency/dashboard');
        } else {
          router.push(`/onboarding/new-agency?name=${session.user.name}&email=${session.user.email}`);
        }
      } else {
        setError(res?.error || 'Firebase sign-in failed');
      }
    } catch (error) {
      console.error("Google sign-in error", error);
      setError('An error occurred during Google sign-in.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegisteredSuccess(false);

    const result = await signIn('credentials', {
      redirect: false, // Keep redirect: false to handle redirection manually
      email,
      password,
    });

    setLoading(false);

    if (result?.ok) {
      // Manually fetch session to get user role
      const session = await getSession();
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (session?.user?.role === 'AGENCY_OWNER' || session?.user?.role === 'AGENCY_MEMBER' || session?.user?.role === 'AGENCY_SUPER_AGENT') {
        router.push('/agency/dashboard');
      } else {
        // Default redirect or error handling
        router.push('/'); 
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
            <hr className="my-4" />
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={handleGoogleSignIn}
            >
              Se connecter avec Google
            </Button>
            <p className="text-center mt-3">
              Pas encore de compte ? <Link href="/register">Inscrivez-vous ici</Link>
            </p>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

// Removed getServerSideProps function

export default LoginPage;
