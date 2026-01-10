import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PostingData } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Loader } from '../../components/Loader';
import styles from './Postings.module.css';

export function Postings() {
    const { getPostings } = useAuth();
    const [postings, setPostings] = useState<PostingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPostings = async () => {
            try {
                const data = await getPostings();
                setPostings(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load postings');
            } finally {
                setIsLoading(false);
            }
        };
        loadPostings();
    }, [getPostings]);

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
                                <span className={styles.statValue}>{postings.length}</span>
                                <span className={styles.statLabel}>Total Postings</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>
                                    {postings.reduce((sum, p) => sum + (p.count || 0), 0)}
                                </span>
                                <span className={styles.statLabel}>Total Count</span>
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
                        {postings.map((posting, index) => (
                            <Card key={posting.id} className={styles.postingCard} style={{ animationDelay: `${index * 0.05}s` }}>
                                <CardHeader>
                                    <CardTitle>
                                        {posting.year || 'N/A'} - {posting.state || 'N/A'}
                                    </CardTitle>
                                    <span className={styles.date}>{formatDate(posting.created_at)}</span>
                                </CardHeader>
                                <CardContent>
                                    {/* Mandates */}
                                    {posting.mandates && posting.mandates.length > 0 && (
                                        <div className={styles.postingField}>
                                            <span className={styles.fieldLabel}>Mandates</span>
                                            <div className={styles.tagList}>
                                                {posting.mandates.map((mandate, i) => (
                                                    <span key={i} className={styles.tag}>
                                                        {String(mandate)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Assignments */}
                                    {posting.assignments && posting.assignments.length > 0 && (
                                        <div className={styles.postingField}>
                                            <span className={styles.fieldLabel}>Assignments</span>
                                            <div className={styles.tagList}>
                                                {posting.assignments.map((assignment, i) => (
                                                    <span key={i} className={`${styles.tag} ${styles.assignmentTag}`}>
                                                        {String(assignment)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Venues */}
                                    {posting.assignment_venue && posting.assignment_venue.length > 0 && (
                                        <div className={styles.postingField}>
                                            <span className={styles.fieldLabel}>Venues</span>
                                            <div className={styles.tagList}>
                                                {posting.assignment_venue.map((venue, i) => (
                                                    <span key={i} className={`${styles.tag} ${styles.venueTag}`}>
                                                        📍 {String(venue)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Details Grid */}
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
                                            <span className={styles.detailLabel}>Nights</span>
                                            <span className={styles.detailValue}>{posting.numb_of__nites ?? 'N/A'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Count</span>
                                            <span className={styles.detailValue}>{posting.count ?? 0}</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {posting.description && (
                                        <div className={styles.description}>
                                            <span className={styles.fieldLabel}>Description</span>
                                            <p className={styles.descriptionText}>{posting.description}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
