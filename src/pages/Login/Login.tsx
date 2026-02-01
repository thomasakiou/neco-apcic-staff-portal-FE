import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import styles from './Login.module.css';

export function Login() {
    const [staffNumber, setStaffNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!staffNumber.trim()) {
            setError('Please enter your file number');
            return;
        }

        if (!password.trim()) {
            setError('Please enter your date of birth');
            return;
        }

        setIsLoading(true);
        try {
            await login(staffNumber.trim(), password.trim());
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            const message = err instanceof Error
                ? err.message
                : 'Login failed. Please check your credentials.';
            setError(message);
            alert(`⚠️ Login Failed: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.backgroundDecor}>
                <div className={styles.circle1} />
                <div className={styles.circle2} />
            </div>

            <div className={styles.content}>
                <div className={styles.logoSection}>
                    <img
                        src="/images/neco.png"
                        alt="NECO Logo"
                        className={styles.logo}
                    />
                    <h1 className={styles.title}>APCIC Staff Portal</h1>
                    <p className={styles.subtitle}>
                        National Examinations Council
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formCard}>
                        <h2 className={styles.formTitle}>Welcome Back</h2>
                        <p className={styles.formSubtitle}>
                            Sign in with your credentials to continue
                        </p>

                        {error && (
                            <div className={styles.errorAlert} role="alert">
                                <span className={styles.errorIcon}>⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className={styles.fields}>
                            <Input
                                label="File Number"
                                type="text"
                                placeholder="Enter your staff file number"
                                value={staffNumber}
                                onChange={(e) => setStaffNumber(e.target.value)}
                                autoComplete="username"
                                autoFocus
                            />

                            <Input
                                label="Date of Birth"
                                type="password"
                                placeholder="Enter DOB (ddmmyyyy format, e.g., 26041981)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                hint="Format: DDMMYYYY (e.g., 26th April 1981 = 26041981)"
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            isLoading={isLoading}
                            className={styles.submitButton}
                        >
                            Sign In
                        </Button>
                    </div>
                </form>

                <p className={styles.footer}>
                    © {new Date().getFullYear()} National Examinations Council
                </p>
            </div>
        </div>
    );
}
