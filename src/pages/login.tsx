import { useState, useEffect } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from 'next/link';
import { Alert } from 'react-bootstrap';
import styles from '@/styles/Login.module.css';
import { FaEnvelope, FaLock, FaGoogle, FaArrowRight } from 'react-icons/fa';
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
        <div className={styles.brandSection}>
          <div className={styles.logoWrapper}>
            <Image src="/Logo_name.png" alt="LeadEstate Logo" width={120} height={120} className={styles.logo} />
          </div>
          <h1 className={styles.title}>LeadEstate</h1>
          <p className={styles.subtitle}>Transformez vos prospects en clients avec la plateforme CRM #1 pour l'immobilier</p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Gestion intelligente des prospects</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Suivi des propriétés en temps réel</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Analyses et rapports détaillés</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.formContainer}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Bon retour !</h2>
            <p className={styles.formSubtitle}>Connectez-vous à votre compte</p>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            {registeredSuccess && (
              <Alert variant="success" className={styles.alert}>
                Inscription réussie ! Vous pouvez maintenant vous connecter.
              </Alert>
            )}
            {error && <Alert variant="danger" className={styles.alert}>{error}</Alert>}
            
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

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
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
              onClick={handleGoogleSignIn}
            >
              <FaGoogle className={styles.googleIcon} />
              Google
            </button>

            <p className={styles.link}>
              Pas encore de compte ? <Link href="/register" className={styles.linkText}>Inscrivez-vous gratuitement</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
