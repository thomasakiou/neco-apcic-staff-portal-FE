import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/Card';
import { Loader } from '../../components/Loader';
import styles from './Dashboard.module.css';

export function Dashboard() {
    const { profile, getPostings, getAPC } = useAuth();
    const [stats, setStats] = useState({
        postingsCount: 0,
        activeAssignments: 0,
        loading: true,
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [postings, apc] = await Promise.all([
                    getPostings().catch(() => []),
                    getAPC().catch(() => null),
                ]);

                // Count active assignments from APC
                let activeCount = 0;
                if (apc) {
                    const assignmentFields = [
                        'tt', 'mar_accr', 'ncee', 'gifted', 'becep', 'bece_mrkp',
                        'ssce_int', 'swapping', 'ssce_int_mrk', 'oct_accr', 'ssce_ext',
                        'ssce_ext_mrk', 'pur_samp', 'int_audit', 'stock_tk',
                    ];
                    assignmentFields.forEach((field) => {
                        if (apc[field as keyof typeof apc]) activeCount++;
                    });
                }

                setStats({
                    postingsCount: postings.length,
                    activeAssignments: activeCount,
                    loading: false,
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
                setStats((prev) => ({ ...prev, loading: false }));
            }
        };

        loadStats();
    }, [getPostings, getAPC]);

    if (!profile) {
        return <Loader fullScreen text="Loading your dashboard..." />;
    }

    const quickLinks = [
        {
            to: '/profile',
            icon: '👤',
            title: 'My Profile',
            description: 'View and edit your contact info',
            color: 'primary',
        },
        {
            to: '/apc',
            icon: '📋',
            title: 'APC Assignments',
            description: 'View your annual work plan',
            color: 'accent',
        },
        {
            to: '/postings',
            icon: '📍',
            title: 'Posting History',
            description: 'View your posting records',
            color: 'success',
        },
    ];

    return (
        <div className={styles.container}>
            {/* Welcome Section */}
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeContent}>
                    <h1 className={styles.welcomeTitle}>
                        Welcome back, <span className={styles.name}>{profile.full_name?.split(' ')[0]}</span>! 👋
                    </h1>
                    <p className={styles.welcomeSubtitle}>
                        Here's an overview of your NECO staff profile
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className={styles.statsGrid}>
                <Card variant="elevated" className={styles.statCard}>
                    <CardContent>
                        <div className={styles.statIcon}>📊</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>
                                {stats.loading ? '...' : stats.postingsCount}
                            </span>
                            <span className={styles.statLabel}>Total Postings</span>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated" className={styles.statCard}>
                    <CardContent>
                        <div className={styles.statIcon}>✅</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>
                                {stats.loading ? '...' : stats.activeAssignments}
                            </span>
                            <span className={styles.statLabel}>Active Assignments</span>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated" className={styles.statCard}>
                    <CardContent>
                        <div className={styles.statIcon}>🏢</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{profile.station || 'N/A'}</span>
                            <span className={styles.statLabel}>Station</span>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="elevated" className={styles.statCard}>
                    <CardContent>
                        <div className={styles.statIcon}>💼</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{profile.conr || 'N/A'}</span>
                            <span className={styles.statLabel}>Grade Level</span>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Quick Links */}
            <section className={styles.quickLinksSection}>
                <h2 className={styles.sectionTitle}>Quick Access</h2>
                <div className={styles.quickLinksGrid}>
                    {quickLinks.map((link) => (
                        <Link key={link.to} to={link.to} className={styles.quickLinkCard}>
                            <Card hoverable className={styles.quickCardInner}>
                                <CardContent>
                                    <span className={styles.quickIcon}>{link.icon}</span>
                                    <h3 className={styles.quickTitle}>{link.title}</h3>
                                    <p className={styles.quickDescription}>{link.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Profile Summary */}
            <section className={styles.profileSummary}>
                <h2 className={styles.sectionTitle}>Profile Summary</h2>
                <Card>
                    <CardContent>
                        <div className={styles.profileGrid}>
                            <div className={styles.profileItem}>
                                <span className={styles.profileLabel}>File Number</span>
                                <span className={styles.profileValue}>{profile.fileno}</span>
                            </div>
                            <div className={styles.profileItem}>
                                <span className={styles.profileLabel}>Full Name</span>
                                <span className={styles.profileValue}>{profile.full_name}</span>
                            </div>
                            <div className={styles.profileItem}>
                                <span className={styles.profileLabel}>Rank</span>
                                <span className={styles.profileValue}>{profile.rank || 'N/A'}</span>
                            </div>
                            <div className={styles.profileItem}>
                                <span className={styles.profileLabel}>State of Origin</span>
                                <span className={styles.profileValue}>{profile.state || 'N/A'}</span>
                            </div>
                            <div className={styles.profileItem}>
                                <span className={styles.profileLabel}>Email</span>
                                <span className={styles.profileValue}>{profile.email || 'Not set'}</span>
                            </div>
                            <div className={styles.profileItem}>
                                <span className={styles.profileLabel}>Phone</span>
                                <span className={styles.profileValue}>{profile.phone || 'Not set'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
