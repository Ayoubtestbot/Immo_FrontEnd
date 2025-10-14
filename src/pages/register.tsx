import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn, getSession } from 'next-auth/react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Alert } from 'react-bootstrap';
import Link from 'next/link';
import styles from '@/styles/Login.module.css';

import Image from 'next/image';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const res = await signIn('firebase', { idToken, redirect: false });

      if (res?.ok) {
        const session = await getSession();
        if (session?.user) {
          router.push(`/onboarding/new-agency?name=${session.user.name}&email=${session.user.email}`);
        }
      } else {
        setError(res?.error || 'Firebase sign-up failed');
      }
    } catch (error) {
      console.error("Google sign-up error", error);
      setError('An error occurred during Google sign-up.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, agencyName }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to register');
      }

      setLoading(false);
      router.push('/login?registered=true');
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.imageContainer}>
        <Image src="/Logo_name.png" alt="LeadEstate Logo" width={150} height={150} />
        <h1 className={styles.title}>LeadEstate</h1>
        <p className={styles.subtitle}>Rejoignez notre communauté et commencez à gérer vos prospects efficacement.</p>
      </div>
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">Inscription</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <input
            type="text"
            placeholder="Votre Nom"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <input
            type="text"
            placeholder="Nom de votre Agence"
            className={styles.input}
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            required
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Inscription en cours...' : "S&apos;inscrire"}
          </button>
          <hr className="my-4" />
          <button
            type="button"
            className={`${styles.button} ${styles.googleButton}`}
            onClick={handleGoogleSignUp}
          >
            S&apos;inscrire avec Google
          </button>
          <p className={styles.link}>
            Déjà un compte ? <Link href="/login" legacyBehavior>Connectez-vous ici</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;