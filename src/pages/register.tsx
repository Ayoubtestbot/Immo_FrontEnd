import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn, getSession } from 'next-auth/react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Alert } from 'react-bootstrap';
import Link from 'next/link';
import styles from '@/styles/Login.module.css';
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaGoogle, FaArrowRight } from 'react-icons/fa';
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
        <div className={styles.brandSection}>
          <div className={styles.logoWrapper}>
            <Image src="/Logo_name.png" alt="LeadEstate Logo" width={120} height={120} className={styles.logo} />
          </div>
          <h1 className={styles.title}>LeadEstate</h1>
          <p className={styles.subtitle}>Rejoignez des milliers d'agences immobilières qui transforment leur gestion de prospects</p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Essai gratuit de 14 jours</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Aucune carte de crédit requise</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Configuration en 5 minutes</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.formContainer}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Créer un compte</h2>
            <p className={styles.formSubtitle}>Commencez votre essai gratuit maintenant</p>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <Alert variant="danger" className={styles.alert}>{error}</Alert>}
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nom complet</label>
              <div className={styles.inputWrapper}>
                <FaUser className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Adresse e-mail</label>
              <div className={styles.inputWrapper}>
                <FaEnvelope className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Mot de passe</label>
              <div className={styles.inputWrapper}>
                <FaLock className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Nom de votre agence</label>
              <div className={styles.inputWrapper}>
                <FaBuilding className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Agence Immobilière XYZ"
                  className={styles.input}
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Inscription en cours...
                </>
              ) : (
                <>
                  Créer mon compte
                  <FaArrowRight className={styles.buttonIcon} />
                </>
              )}
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerText}>ou continuer avec</span>
            </div>

            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleSignUp}
            >
              <FaGoogle className={styles.googleIcon} />
              Google
            </button>

            <p className={styles.link}>
              Déjà un compte ? <Link href="/login" className={styles.linkText}>Connectez-vous ici</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;