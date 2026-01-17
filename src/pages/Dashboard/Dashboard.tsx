import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/Card';
import { Loader } from '../../components/Loader';
import { APC_FIELD_KEYS } from '../../types';
import styles from './Dashboard.module.css';

// Fallback mapping (Sync with APC.tsx)
const FALLBACK_ASSIGNMENT_NAMES: Record<string, string> = {
    'tt': 'Token Test',
    'mar-accr': 'March Accreditation',
    'ncee': 'NCEE Examination',
    'gifted': 'Gifted Examination',
    'becep': 'BECEP Examination',
    'bece-mrkp': 'BECE Marking',
    'ssce-int': 'SSCE Internal Examination',
    'swapping': 'Swapping',
    'ssce-int-mrk': 'SSCE Internal Marking',
    'oct-accr': 'October Accreditation',
    'ssce-ext': 'SSCE External Examination',
    'ssce-ext-mrk': 'SSCE External Marking',
    'pur-samp': 'Purchasing/Sampling',
    'int-audit': 'Internal Audit',
    'stock-tk': 'Stock Taking',
};

const getFirstName = (fullName: string | undefined) => {
    if (!fullName) return '';
    const titleRegex = /^(mr|mrs|ms|miss|dr|prof|engr|chief|arc|pharm|barr|alh|alhaja|pst|rev|bishop)\.?\s+/i;
    const nameWithoutTitle = fullName.replace(titleRegex, '');
    return nameWithoutTitle.split(' ')[0];
};

export function Dashboard() {
    const { profile, getPostings, getAPC, getAssignments } = useAuth();
    const [stats, setStats] = useState({
        postingsCount: 0,
        activeAssignments: 0,
        loading: true,
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [postings, apc, assignments] = await Promise.all([
                    getPostings().catch(() => []),
                    getAPC().catch(() => null),
                    getAssignments().catch(() => []),
                ]);

                // 1. Calculate Total Postings (Assignments)
                const totalPostings = postings.reduce((acc: any, p: any) => acc + (p.assignments?.length || 0), 0);

                // 2. Build Posted Names Set
                const postedNames = new Set<string>();
                postings.forEach(p => {
                    p.assignments?.forEach(a => postedNames.add(a.toLowerCase().trim()));
                });

                // 3. Build Code-to-Name Map
                const codeToNameMap: Record<string, string> = { ...FALLBACK_ASSIGNMENT_NAMES };
                assignments.forEach((a) => {
                    codeToNameMap[a.code.toLowerCase()] = a.name;
                });

                const getAssignmentName = (code: string) => codeToNameMap[code.toLowerCase().trim()] || code;

                // 4. Calculate Pending Active Assignments
                let activeCount = 0;
                if (apc) {
                    APC_FIELD_KEYS.forEach((field) => {
                        if (apc[field as keyof typeof apc]) {
                            const code = field.replace(/_/g, '-');
                            const name = getAssignmentName(code);

                            const isPosted = postedNames.has(name.toLowerCase().trim())
                                || postedNames.has(code.toLowerCase().trim())
                                || postedNames.has(field.toLowerCase().trim());

                            if (!isPosted) {
                                activeCount++;
                            }
                        }
                    });
                }

                setStats({
                    postingsCount: totalPostings,
                    activeAssignments: activeCount,
                    loading: false,
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
                setStats((prev) => ({ ...prev, loading: false }));
            }
        };

        loadStats();
    }, [getPostings, getAPC, getAssignments]);

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
                        Welcome back, <span className={styles.name}>{getFirstName(profile.full_name)}</span>! 👋
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
