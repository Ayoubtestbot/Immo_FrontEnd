import { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import styles from '@/styles/Login.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const router = useRouter();

  useEffect(() => {
    if (router.query.email) {
      setEmail(router.query.email as string);
    }
  }, [router.query.email]);

  const validatePassword = (password: string) => {
    setPasswordValidation({
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessage(data.message);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.imageContainer}>
        <Image src="/Lead.png" alt="LeadEstate Logo" width={150} height={150} />
        <h1 className={styles.title}>LeadEstate</h1>
        <p className={styles.subtitle}>Votre partenaire immobilier de confiance</p>
      </div>
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">Réinitialiser le mot de passe</h2>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly
            required
          />
          <input
            type="text"
            placeholder="Code temporaire"
            className={styles.input}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className={styles.input}
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            required
          />
          {isPasswordFocused && (!passwordValidation.hasUpperCase || !passwordValidation.hasNumber || !passwordValidation.hasSpecialChar) && (
            <div className="mb-3">
              <small className={passwordValidation.hasUpperCase ? 'text-success' : 'text-danger'}>
                Au moins une lettre majuscule
              </small>
              <br />
              <small className={passwordValidation.hasNumber ? 'text-success' : 'text-danger'}>
                Au moins un chiffre
              </small>
              <br />
              <small className={passwordValidation.hasSpecialChar ? 'text-success' : 'text-danger'}>
                Au moins un caractère spécial
              </small>
            </div>
          )}
          <button type="submit" className={styles.button} disabled={loading || !passwordValidation.hasUpperCase || !passwordValidation.hasNumber || !passwordValidation.hasSpecialChar}>
            {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
          </button>
          <p className={styles.link}>
            Retour à la <Link href="/login" legacyBehavior>connexion</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
