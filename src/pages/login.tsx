import { useState, useEffect } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from 'next/link';
import { Alert } from 'react-bootstrap';
import styles from '@/styles/Login.module.css';

import Image from 'next/image';

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
      router.replace('/login', undefined, { shallow: true });
    }
  }, [router.query.registered, router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const res = await signIn('firebase', { idToken, redirect: false });

      if (res?.ok) {
        const session = await getSession();
        if (session) { // Add null check here
          if (session.user?.role === 'ADMIN') {
            router.push('/admin/dashboard');
          } else if (session.user?.agencyId) {
            router.push('/agency/dashboard');
          } else {
            router.push(`/onboarding/new-agency?name=${session.user.name}&email=${session.user.email}`);
          }
        } else {
          // Handle the case where session is null
          setError('Failed to get session information.');
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
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.ok) {
      const session = await getSession();
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (session?.user?.role === 'AGENCY_OWNER' || session?.user?.role === 'AGENCY_MEMBER' || session?.user?.role === 'AGENCY_SUPER_AGENT') {
        router.push('/agency/dashboard');
      } else {
        router.push('/'); 
      }
    } else {
      setError(result?.error || 'Email ou mot de passe invalide');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.imageContainer}>
        <Image src="/Logo_name.png" alt="LeadEstate Logo" width={150} height={150} />
        <h1 className={styles.title}>LeadEstate</h1>
        <p className={styles.subtitle}>Votre partenaire immobilier de confiance</p>
      </div>
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">Connexion</h2>
          {registeredSuccess && (
            <Alert variant="success">
              Inscription réussie ! Vous pouvez maintenant vous connecter.
            </Alert>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
          <hr className="my-4" />
          <button
            type="button"
            className={`${styles.button} ${styles.googleButton}`}
            onClick={handleGoogleSignIn}
          >
            Se connecter avec Google
          </button>
          <p className={styles.link}>
            Pas encore de compte ? <Link href="/register" legacyBehavior>Inscrivez-vous ici</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
