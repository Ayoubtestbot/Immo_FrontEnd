import { useState } from 'react';
import { useRouter } from 'next/router';
import { Alert } from 'react-bootstrap';
import styles from '@/styles/Login.module.css';
import Link from 'next/link';
import Image from 'next/image';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      router.push(`/reset-password?email=${email}`);
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
          <h2 className="text-center mb-4">Mot de passe oublié</h2>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <p>Entrez votre adresse e-mail et nous vous enverrons un code pour réinitialiser votre mot de passe.</p>
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Envoyer le code'}
          </button>
          <p className={styles.link}>
            Retour à la <Link href="/login" legacyBehavior>connexion</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
