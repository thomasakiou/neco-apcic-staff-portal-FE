import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PostingData } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Loader } from '../../components/Loader';
import styles from './Postings.module.css';
import { APCData } from '../../types';

export function Postings() {
    const { getPostings, getAPC, profile } = useAuth();
    const [postings, setPostings] = useState<PostingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [apc, setApc] = useState<APCData | null>(null);    

    const loadPostings = useCallback(async () => {
        // Don't fetch if profile hasn't been loaded yet
        if (!profile) return;

        setIsLoading(true);
        try {
            const [postingsData, apcData] = await Promise.all([
                getPostings(),
                getAPC()
            ]);
            setPostings(postingsData);
            setApc(apcData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [getPostings, getAPC, profile]);

    useEffect(() => {
        // Only load data when profile is available
        if (profile) {
            loadPostings();
        }
    }, [loadPostings, profile]);

    if (isLoading) {
        return <Loader fullScreen text="Loading postings..." />;
    }

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Calculate total assignments across all postings (always use count)
    // const totalAssignments = postings.reduce((acc, p) => acc + (p.count || 0), 0);
    const totalAssignments = apc?.count || 0;
    
    // Calculate total posted_for across all postings
    const totalPostedFor = postings.reduce((acc, p) => acc + (p.posted_for || 0), 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Posting History</h1>
                <p className={styles.subtitle}>View all your posting records and assignments</p>
            </header>

            {error && (
                <div className={styles.alert} role="alert">
                    ⚠️ {error}
                </div>
            )}

            {/* Stats */}
            <section className={styles.statsSection}>
                <Card variant="elevated">
                    <CardContent>
                        <div className={styles.statsRow}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{totalAssignments}</span>
                                <span className={styles.statLabel}>Total Assignments</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{totalPostedFor}</span>
                                <span className={styles.statLabel}>Posted For</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Postings List */}
            <section className={styles.listSection}>
                {postings.length === 0 ? (
                    <Card>
                        <CardContent>
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>📍</span>
                                <h3 className={styles.emptyTitle}>No Postings Found</h3>
                                <p className={styles.emptyText}>
                                    You don't have any posting records yet.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className={styles.postingsList}>
                        {postings.map((posting) => (
                            <div key={posting.id} className={styles.postingGroup}>
                                {/* Summary Card (Top Card) */}
                                <Card className={styles.summaryCard}>
                                    <CardHeader>
                                        <CardTitle>{posting.year || 'N/A'}</CardTitle>
                                        <span className={styles.date}>{formatDate(posting.created_at)}</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={styles.detailsGrid}>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Station</span>
                                                <span className={styles.detailValue}>{posting.station || 'N/A'}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>CONRAISS</span>
                                                <span className={styles.detailValue}>{posting.conraiss || 'N/A'}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Count</span>
                                                <span className={styles.detailValue}>{posting.count ?? 0}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Individual Assignment Cards */}
                                {posting.assignments && posting.assignments.length > 0 && (
                                    <div className={styles.assignmentsGrid}>
                                        {posting.assignments.map((assignment, index) => (
                                            <Card key={`${posting.id}-${index}`} className={styles.assignmentCard}>
                                                <CardContent>
                                                    {/* Assignment Name */}
                                                    <div className={styles.postingField}>
                                                        <span className={styles.fieldLabel}>Assignment</span>
                                                        <span className={`${styles.tag} ${styles.assignmentTag}`}>
                                                            {assignment}
                                                        </span>
                                                    </div>

                                                    {/* Mandate (Split by index) */}
                                                    {posting.mandates && posting.mandates.length > index && (
                                                        <div className={styles.postingField}>
                                                            <span className={styles.fieldLabel}>Mandate</span>
                                                            <span className={styles.tag}>
                                                                {String(posting.mandates[index])}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Venue (Split by index) */}
                                                    {posting.assignment_venue && posting.assignment_venue.length > index && (
                                                        <div className={styles.postingField}>
                                                            <span className={styles.fieldLabel}>Venue</span>
                                                            <span className={`${styles.tag} ${styles.venueTag}`}>
                                                                📍 {String(posting.assignment_venue[index])}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Description */}
                                                    {posting.description && (
                                                        <div className={styles.postingField}>
                                                            <span className={styles.fieldLabel}>Description</span>
                                                            <p className={styles.descriptionText}>{posting.description}</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
