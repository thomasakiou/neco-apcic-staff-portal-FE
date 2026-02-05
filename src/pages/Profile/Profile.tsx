import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Loader } from '../../components/Loader';
import styles from './Profile.module.css';

export function Profile() {
    const { profile } = useAuth();

    if (!profile) {
        return <Loader fullScreen text="Loading profile..." />;
    }

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const profileFields = [
        { label: 'File Number', value: profile.fileno },
        { label: 'Full Name', value: profile.full_name },
        { label: 'Station', value: profile.station },
        { label: 'Rank', value: profile.rank },
        { label: 'Grade Level (CONR)', value: profile.conr },
        { label: 'Qualification', value: profile.qualification },
        { label: 'Gender', value: profile.sex === 'M' ? 'Male' : profile.sex === 'F' ? 'Female' : profile.sex },
        { label: 'Date of Birth', value: formatDate(profile.dob) },
        { label: 'Date of First Appointment', value: formatDate(profile.dofa) },
        { label: 'Date of Appointment to NECO', value: formatDate(profile.doan) },
        { label: 'Date of Present Appointment', value: formatDate(profile.dopa) },
        { label: 'State of Origin', value: profile.state },
        { label: 'LGA', value: profile.lga },
    ];

    const roles = [
        { label: 'HOD', active: profile.is_hod },
        { label: 'Director', active: profile.is_director },
        { label: 'Education', active: profile.is_education },
        { label: 'State Coordinator', active: profile.is_state_cordinator },
    ].filter((r) => r.active);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>My Profile</h1>
                <p className={styles.subtitle}>View your staff data and update contact information</p>
            </header>

            {/* Roles */}
            {roles.length > 0 && (
                <section className={styles.section}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Roles & Designations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.rolesList}>
                                {roles.map((role) => (
                                    <span key={role.label} className={styles.roleBadge}>
                                        {role.label}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Staff Details */}
            <section className={styles.section}>
                <Card>
                    <CardHeader>
                        <CardTitle>Staff Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.detailsGrid}>
                            {profileFields.map((field) => (
                                <div key={field.label} className={styles.detailItem}>
                                    <span className={styles.detailLabel}>{field.label}</span>
                                    <span className={styles.detailValue}>{field.value || 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Remarks */}
            {profile.remark && (
                <section className={styles.section}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Remarks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={styles.remarks}>{profile.remark}</p>
                        </CardContent>
                    </Card>
                </section>
            )}
        </div>
    );
}
