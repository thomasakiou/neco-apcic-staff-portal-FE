import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/Card';
import { Loader } from '../../components/Loader';
import styles from './Dashboard.module.css';

const getWelcomeName = (fullName: string | undefined) => {
    if (!fullName) return '';
    const titleRegex = /^(mr|mrs|ms|miss|dr|prof|engr|chief|arc|pharm|barr|alh|alhaja|pst|rev|bishop)\.?\s+/i;
    const match = fullName.match(titleRegex);
    const title = match ? match[0].trim() + ' ' : '';
    const nameWithoutTitle = fullName.replace(titleRegex, '');
    const firstName = nameWithoutTitle.split(' ')[0];
    return `${title}${firstName}`.trim();
};

export function Dashboard() {
    const { profile, getPostings, getAPC, selectedYear, setSelectedYear, availableYears } = useAuth();
    const [stats, setStats] = useState({
        postingsCount: 0,
        activeAssignments: 0,
        loading: true,
    });

    useEffect(() => {
        const loadStats = async () => {
            if (!profile) return;
            setStats(prev => ({ ...prev, loading: true }));
            try {
                const [postings, apc] = await Promise.all([
                    getPostings(selectedYear).catch(() => []),
                    getAPC(selectedYear).catch(() => null),
                ]);

                // Filter postings for selected year
                const yearPostings = postings.filter(p => !selectedYear || selectedYear === 'All' || String(p.year) === String(selectedYear));

                // 1. Calculate Total Postings (Assignments) for selected year
                const totalPostings = yearPostings.reduce((acc: any, p: any) => acc + (p.assignments?.length || 0), 0);

                // 2. Calculate Pending Active Assignments based on CONRAISS rules:
                // - all category HOD = 4 assignments
                // - conraiss 14 and 13 = 3 assignments
                // - conraiss 11 and 12 = 2 assignments
                // - conraiss 9 to end = 1 assignment
                let activeCount = 0;
                if (apc) {
                    const getExpectedTotal = (): number => {
                        if (profile.is_hod) return 4;
                        const conrStr = profile.conr || apc.conraiss || '';
                        const match = conrStr.match(/(\d+)/);
                        const level = match ? parseInt(match[1], 10) : 0;
                        if (level >= 13) return 3;
                        if (level >= 11) return 2;
                        return 1;
                    };
                    const expectedTotal = getExpectedTotal();
                    const yearPostingsCount = postings
                        .filter((p) => String(p.year) === String(selectedYear))
                        .reduce((sum, p) => sum + (p.assignments?.length || 0), 0);
                    activeCount = Math.max(0, expectedTotal - yearPostingsCount);
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
    }, [getPostings, getAPC, profile, selectedYear]);

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
            description: 'View your Annual Posting Calendar (APC)',
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
                <div className={styles.welcomeRow}>
                    <div className={styles.welcomeContent}>
                        <h1 className={styles.welcomeTitle}>
                            Welcome, <span className={styles.name}>{getWelcomeName(profile.full_name)}</span>! 👋
                        </h1>
                        <p className={styles.welcomeSubtitle}>
                            Overview of your NECO staff profile for calendar year {selectedYear}
                        </p>
                    </div>
                    <div className={styles.yearSelectWrapper} title="Select Calendar Year">
                        <span className={styles.yearSelectLabel}>Year:</span>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className={styles.yearSelect}
                            aria-label="Filter Calendar Year"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
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
                            <span className={styles.statLabel}>Postings ({selectedYear})</span>
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
                            <span className={styles.statLabel}>Assignments Left ({selectedYear})</span>
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
