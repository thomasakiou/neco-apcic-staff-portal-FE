import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { APCData, AssignmentData, PostingData, APC_FIELD_KEYS } from '../../types';

import { Card, CardContent } from '../../components/Card';
import { Loader } from '../../components/Loader';
import styles from './APC.module.css';

// Fallback mapping when API is not accessible (APCIC staff portal token doesn't have access to admin endpoints)
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

export function APC() {
    const { getAPC, getPostings, getAssignments, profile, user } = useAuth();
    const [apc, setApc] = useState<APCData | null>(null);
    const [assignments, setAssignments] = useState<AssignmentData[]>([]);
    const [postedAssignmentNames, setPostedAssignmentNames] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        // Don't fetch if profile hasn't been loaded yet
        if (!profile) return;

        setIsLoading(true);
        try {
            // Load APC data and Postings in parallel
            const [apcData, postingsData] = await Promise.all([
                getAPC(),
                getPostings().catch(err => {
                    console.error("Failed to load postings for APC filter:", err);
                    return [] as PostingData[];
                })
            ]);

            setApc(apcData);

            // Extract all assignment names from posting history for current year (2026)
            const postedNames = new Set<string>();
            postingsData.forEach(p => {
                // p.year might be number or string. Check strictly for 2026.
                if (String(p.year) === '2026') {
                    p.assignments?.forEach(a => postedNames.add(a.toLowerCase().trim()));
                }
            });
            setPostedAssignmentNames(postedNames);

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
            setError(err instanceof Error ? err.message : 'Failed to load APC data');
        } finally {
            setIsLoading(false);
        }
    }, [getAPC, getPostings, getAssignments, user?.token, profile]);

    useEffect(() => {
        // Only load data when profile is available
        if (profile) {
            loadData();
        }
    }, [loadData, profile]);

    if (isLoading) {
        return <Loader fullScreen text="Loading APC data..." />;
    }

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

    // Get value for a field key from APC data
    const getAssignmentValue = (key: string): string | null => {
        if (!apc) return null;
        return apc[key as keyof APCData] as string | null;
    };

    // Get active (or posted) assignments with their resolved names
    const activeAssignments = APC_FIELD_KEYS
        .map((key) => {
            const value = getAssignmentValue(key);
            // Map the field key (e.g. 'ssce_int') to the assignment code (e.g. 'ssce-int')
            const assignmentCode = key.replace(/_/g, '-');
            const name = getAssignmentName(assignmentCode);

            // Check keys/names against posted set
            const nameMatch = postedAssignmentNames.has(name.toLowerCase().trim());
            const codeMatch = postedAssignmentNames.has(assignmentCode.toLowerCase().trim());
            const keyMatch = postedAssignmentNames.has(key.toLowerCase().trim());

            const isPosted = nameMatch || codeMatch || keyMatch;

            return {
                key,
                code: assignmentCode,
                value,
                name,
                isPosted
            };
        })
        .filter((assignment) => {
            // Show assignment if it is marked active in APC data OR if it has been marked as posted
            // Only 'truthy' APC values are considered active.
            return assignment.value || assignment.isPosted;
        });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>APC Assignments</h1>
                <p className={styles.subtitle}>
                    Your Annual Posting Calendar for 2026
                </p>
            </header>

            {error && (
                <div className={styles.alert} role="alert">
                    ⚠️ {error}
                </div>
            )}

            {!apc ? (
                <Card>
                    <CardContent>
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>📋</span>
                            <h3 className={styles.emptyTitle}>No APC Data Found</h3>
                            <p className={styles.emptyText}>
                                Your Annual Performance Calendar has not been set up yet.
                                Please contact your administrator.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Summary */}
                    <section className={styles.summarySection}>
                        <div className={styles.summaryGrid}>
                            <Card variant="elevated">
                                <CardContent className={styles.summaryCard}>
                                    <span className={styles.summaryIcon}>✅</span>
                                    <span className={styles.summaryValue}>{activeAssignments.filter(a => !a.isPosted).length}</span>
                                    <span className={styles.summaryLabel}>Active Assignments</span>
                                </CardContent>
                            </Card>
                            <Card variant="elevated">
                                <CardContent className={styles.summaryCard}>
                                    <span className={styles.summaryIcon}>🔢</span>
                                    <span className={styles.summaryValue}>{apc.count || 0}</span>
                                    <span className={styles.summaryLabel}>Total Count</span>
                                </CardContent>
                            </Card>
                            <Card variant="elevated">
                                <CardContent className={styles.summaryCard}>
                                    <span className={styles.summaryIcon}>📅</span>
                                    <span className={styles.summaryValue}>2026</span>
                                    <span className={styles.summaryLabel}>Year</span>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Active Assignments */}
                    {activeAssignments.length > 0 ? (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Active Assignments</h2>
                            <div className={styles.assignmentsGrid}>
                                {activeAssignments.map((assignment) => (
                                    <Card
                                        key={assignment.key}
                                        className={`${styles.assignmentCard} ${assignment.isPosted ? styles.postedCard : ''}`}
                                    >
                                        <CardContent>
                                            <div className={styles.assignmentHeader}>
                                                <span className={styles.assignmentIcon}>✅</span>
                                                <h3 className={styles.assignmentTitle}>{assignment.name}</h3>
                                                {assignment.isPosted && (
                                                    <span className={styles.postedBadge}>Posted</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {/* Staff Info */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Staff Information</h2>
                        <Card>
                            <CardContent>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>File Number</span>
                                        <span className={styles.infoValue}>{apc.file_no || profile?.fileno}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Name</span>
                                        <span className={styles.infoValue}>{apc.name}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Station</span>
                                        <span className={styles.infoValue}>{apc.station || 'N/A'}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>CONRAISS</span>
                                        <span className={styles.infoValue}>{apc.conraiss || 'N/A'}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Status</span>
                                        <span className={`${styles.statusBadge} ${apc.active ? styles.active : styles.inactive}`}>
                                            {apc.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </>
            )}
        </div>
    );
}
