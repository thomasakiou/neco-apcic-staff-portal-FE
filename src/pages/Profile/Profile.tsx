import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Loader } from '../../components/Loader';
import styles from './Profile.module.css';

export function Profile() {
    const { profile, updateContact } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

    const handleEdit = () => {
        setPhone(profile.phone || '');
        setEmail(profile.email || '');
        setIsEditing(true);
        setMessage(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setMessage(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            await updateContact(phone, email);
            setMessage({ type: 'success', text: 'Contact information updated successfully!' });
            setIsEditing(false);
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update contact' });
        } finally {
            setIsSaving(false);
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

            {/* Status Message */}
            {message && (
                <div className={`${styles.alert} ${styles[message.type]}`} role="alert">
                    {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                </div>
            )}

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

            {/* Contact Information (Editable) */}
            <section className={styles.section}>
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <div className={styles.editForm}>
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter phone number"
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email address"
                                />
                                <div className={styles.editActions}>
                                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} isLoading={isSaving}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.contactGrid}>
                                    <div className={styles.contactItem}>
                                        <span className={styles.contactIcon}>📞</span>
                                        <div>
                                            <span className={styles.contactLabel}>Phone</span>
                                            <span className={styles.contactValue}>{profile.phone || 'Not set'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.contactItem}>
                                        <span className={styles.contactIcon}>📧</span>
                                        <div>
                                            <span className={styles.contactLabel}>Email</span>
                                            <span className={styles.contactValue}>{profile.email || 'Not set'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.editActions}>
                                    <Button variant="outline" onClick={handleEdit}>
                                        ✏️ Edit Contact
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </section>

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
