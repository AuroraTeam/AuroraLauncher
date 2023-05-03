import classes from './index.module.sass';

interface ServerButtonProps {
    onClick: () => void;
    server: any;
}

export function ServerButton({ onClick, server }: ServerButtonProps) {
    return (
        <button className={classes.button} onClick={onClick}>
            <span className={classes.title}>{server.title}</span>
            <span className={classes.online}>
                {server.online?.current || 10} / {server.online?.maximum || 100}
            </span>
            <div className={classes.next}>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.16 9.08V7.08H12.16L6.66 1.58L8.08 0.16L16 8.08L8.08 16L6.66 14.58L12.16 9.08H0.16Z"
                        fill="#fff"
                    />
                </svg>
            </div>
            <progress
                className={classes.progress}
                value={server.online?.current || 10}
                max={server.online?.maximum || 100}
            ></progress>
        </button>
    );
}
