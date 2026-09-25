import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PostingData } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Loader } from '../../components/Loader';
import styles from './Postings.module.css';
import { APCData, AssignmentData, APC_FIELD_KEYS } from '../../types';

// Fallback mapping when API is not accessible (APCIC staff portal token doesn't have access to admin endpoints)
const FALLBACK_ASSIGNMENT_NAMES: Record<string, string> = {
    'tt': 'Trial Testing',
    'mar-accr': 'March Accreditation',
    'ncee': 'NCEE Examination',
    'gifted': 'Gifted Examination',
    'becep': 'BECE Examination',
    'bece-mrkp': 'BECE Marking',
    'ssce-int': 'SSCE Internal Examination',
    'swapping': 'Swapping',
    'ssce-int-mrk': 'SSCE Internal Marking',
    'oct-accr': 'October Accreditation',
    'ssce-ext': 'SSCE External Examination',
    'ssce-ext-mrk': 'SSCE External Marking',
    'pur-samp': 'Purposive Sampling',
    'int-audit': 'Internal Audit',
    'stock-tk': 'Stock Taking',
};

export function Postings() {
    const { getPostings, getAPC, getAssignments, profile, user } = useAuth();
    const [postings, setPostings] = useState<PostingData[]>([]);
    const [assignments, setAssignments] = useState<AssignmentData[]>([]);
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

            // Load assignments map from the API
            if (user?.token) {
                try {
                    const assignmentsData = await getAssignments();
                    setAssignments(assignmentsData);
                } catch {
                    // Silently fail - will use fallback mapping
                    console.log('Using fallback assignment names (API not accessible)');
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [getPostings, getAPC, getAssignments, user?.token, profile]);

    useEffect(() => {
        // Only load data when profile is available
        if (profile) {
            loadPostings();
        }
    }, [loadPostings, profile]);

    if (isLoading) {
        return <Loader fullScreen text="Loading postings..." />;
    }

    // const formatDate = (dateStr: string | null | undefined) => {
    //     if (!dateStr) return '-';
    //     try {
    //         return new Date(dateStr).toLocaleDateString('en-NG', {
    //             day: 'numeric',
    //             month: 'short',
    //             year: 'numeric',
    //         });
    //     } catch {
    //         return dateStr;
    //     }
    // };

    // Calculate total assignments across all postings (always use count)
    // const totalAssignments = postings.reduce((acc, p) => acc + (p.count || 0), 0);
    // Build a code-to-name map from assignments (if available)
    const codeToNameMap: Record<string, string> = { ...FALLBACK_ASSIGNMENT_NAMES };
    assignments.forEach((a) => {
        // Store by lowercase code for case-insensitive matching
        codeToNameMap[a.code.toLowerCase()] = a.name;
    });

    // Get assignment name from code
    const getAssignmentName = (code: string): string => {
        const normalizedCode = code.toLowerCase().trim();
        return codeToNameMap[normalizedCode] || code;
    };

    // Calculate active assignments count (assignments in APC that are not yet posted)
    const calculateActiveAssignments = () => {
        if (!apc) return 0;

        // Extract all assignment names from posting history for current year (2026)
        const postedAssignmentNames = new Set<string>();
        postings.forEach(p => {
            if (String(p.year) === '2026') {
                p.assignments?.forEach(a => postedAssignmentNames.add(a.toLowerCase().trim()));
            }
        });

        // Count active APC assignments not in posted list
        return APC_FIELD_KEYS.reduce((count, key) => {
            const value = apc[key as keyof APCData];
            if (!value) return count; // Skip if not active in APC

            // Check if posted
            const assignmentCode = key.replace(/_/g, '-');
            const name = getAssignmentName(assignmentCode);

            const nameMatch = postedAssignmentNames.has(name.toLowerCase().trim());
            const codeMatch = postedAssignmentNames.has(assignmentCode.toLowerCase().trim());
            const keyMatch = postedAssignmentNames.has(key.toLowerCase().trim());

            const isPosted = nameMatch || codeMatch || keyMatch;

            return isPosted ? count : count + 1;
        }, 0);
    };

    const totalAssignments = calculateActiveAssignments();

    // Calculate total posted_for across all postings
    // const totalPostedFor = postings.reduce((acc, p) => acc + (p.posted_for || 0), 0);

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
                                <span className={styles.statLabel}>Total Assignments Left</span>
                            </div>
                            {/* <div className={styles.statItem}>
                                <span className={styles.statValue}>{totalPostedFor}</span>
                                <span className={styles.statLabel}>Total Assignments Posted</span>
                            </div> */}
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
                        {(() => {
                            const grouped = new Map<string, PostingData[]>();
                            [...postings].sort((a, b) => {
                                const yearA = parseInt(String(a.year || '0'));
                                const yearB = parseInt(String(b.year || '0'));
                                return yearB - yearA;
                            }).forEach(p => {
                                const year = String(p.year || 'N/A');
                                if (!grouped.has(year)) grouped.set(year, []);
                                grouped.get(year)!.push(p);
                            });

                            return Array.from(grouped.entries()).map(([year, yearPostings]) => {
                                const station = yearPostings[0]?.station || 'N/A';
                                const conraiss = yearPostings[0]?.conraiss || 'N/A';

                                const allAssignments: { assignment: string; mandate?: string; venue?: string; description?: string; postingId?: string }[] = [];
                                yearPostings.forEach(posting => {
                                    posting.assignments?.forEach((assignment, index) => {
                                        allAssignments.push({
                                            assignment,
                                            mandate: posting.mandates && posting.mandates.length > index ? String(posting.mandates[index]) : undefined,
                                            venue: posting.assignment_venue && posting.assignment_venue.length > index ? String(posting.assignment_venue[index]) : undefined,
                                            description: posting.description || undefined,
                                            postingId: posting.id,
                                        });
                                    });
                                });

                                allAssignments.sort((a, b) => {
                                    const getRank = (name: string) => {
                                        const normalized = name.toLowerCase().trim();
                                        return APC_FIELD_KEYS.findIndex(key => {
                                            const code = key.replace(/_/g, '-');
                                            const fullName = getAssignmentName(code).toLowerCase().trim();
                                            return key.toLowerCase().trim() === normalized || code === normalized || fullName === normalized;
                                        });
                                    };
                                    return getRank(b.assignment) - getRank(a.assignment);
                                });

                                return (
                                    <Card key={year} className={styles.summaryCard}>
                                        <CardHeader>
                                            <CardTitle>{year}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className={styles.detailsGrid}>
                                                <div className={styles.detailItem}>
                                                    <span className={styles.detailLabel}>Station</span>
                                                    <span className={styles.detailValue}>{station}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span className={styles.detailLabel}>CONRAISS</span>
                                                    <span className={styles.detailValue}>{conraiss}</span>
                                                </div>
                                            </div>

                                            {allAssignments.length > 0 && (
                                                <div className={styles.assignmentsGrid}>
                                                    {allAssignments.map((item, index) => (
                                                        <div key={`${item.postingId}-${index}`} className={styles.assignmentRow}>
                                                            <div className={styles.postingField}>
                                                                <span className={styles.fieldLabel}>Assignment</span>
                                                                <span className={`${styles.tag} ${styles.assignmentTag}`}>
                                                                    {item.assignment}
                                                                </span>
                                                            </div>

                                                            {item.mandate && (
                                                                <div className={styles.postingField}>
                                                                    <span className={styles.fieldLabel}>Mandate</span>
                                                                    <span className={styles.tag}>{item.mandate}</span>
                                                                </div>
                                                            )}

                                                            {item.venue && (
                                                                <div className={styles.postingField}>
                                                                    <span className={styles.fieldLabel}>Posting</span>
                                                                    <span className={`${styles.tag} ${styles.venueTag}`}>
                                                                        📍 {item.venue}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {item.description && (
                                                                <div className={styles.postingField}>
                                                                    <span className={styles.fieldLabel}>Description</span>
                                                                    <p className={styles.descriptionText}>{item.description}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            });
                        })()}
                    </div>
                )}
            </section>
        </div>
    );
}
