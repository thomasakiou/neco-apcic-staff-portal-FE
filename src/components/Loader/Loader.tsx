import styles from './Loader.module.css';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

export function Loader({ size = 'md', text, fullScreen = false }: LoaderProps) {
    const content = (
        <div className={`${styles.loader} ${styles[size]}`}>
            <div className={styles.spinner}>
                <div className={styles.ring}></div>
                <div className={styles.ring}></div>
                <div className={styles.ring}></div>
            </div>
            {text && <p className={styles.text}>{text}</p>}
        </div>
    );

    if (fullScreen) {
        return <div className={styles.fullScreen}>{content}</div>;
    }

    return content;
}
