import { InputHTMLAttributes, forwardRef, useState } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className = '', id, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className={`${styles.wrapper} ${className}`}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}
                <div className={styles.inputContainer}>
                    <input
                        ref={ref}
                        id={inputId}
                        type={inputType}
                        className={`${styles.input} ${error ? styles.error : ''} ${isPassword ? styles.passwordInput : ''}`}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            className={styles.passwordToggle}
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </button>
                    )}
                </div>
                {error && (
                    <span id={`${inputId}-error`} className={styles.errorText} role="alert">
                        {error}
                    </span>
                )}
                {hint && !error && (
                    <span id={`${inputId}-hint`} className={styles.hint}>
                        {hint}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
