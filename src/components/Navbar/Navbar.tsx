import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/profile', label: 'Profile', icon: '👤' },
        { path: '/apc', label: 'APC', icon: '📋' },
        { path: '/postings', label: 'Postings', icon: '📍' },
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                {/* Logo */}
                <Link to="/dashboard" className={styles.logo}>
                    <img src="/images/neco.png" alt="NECO" className={styles.logoImage} />
                    <span className={styles.logoText}>APCIC Staff Portal</span>
                </Link>

                {/* Desktop Navigation */}
                <div className={styles.desktopNav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ''
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={styles.iconButton}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    {/* User Menu */}
                    <div className={styles.userMenu}>
                        <button onClick={logout} className={styles.logoutButton}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className={styles.mobileNav}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`${styles.mobileNavLink} ${location.pathname === item.path ? styles.active : ''
                            }`}
                    >
                        <span className={styles.mobileIcon}>{item.icon}</span>
                        <span className={styles.mobileLabel}>{item.label}</span>
                    </Link>
                ))}

                {/* Mobile Logout */}
                <button
                    onClick={logout}
                    className={`${styles.mobileNavLink} ${styles.mobileLogout}`}
                >
                    <span className={styles.mobileIcon}>🚪</span>
                    <span className={styles.mobileLabel}>Logout</span>
                </button>
            </div>
        </nav>
    );
}
