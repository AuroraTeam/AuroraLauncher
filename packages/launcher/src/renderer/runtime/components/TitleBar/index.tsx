import { useRecoilValue } from 'recoil';

import If from '../If';
import classes from './index.module.sass';
import { titlebarBackBtn, titlebarTitle, titlebarUser } from './states';

export default function TitleBar() {
    const backBtn = useRecoilValue(titlebarBackBtn);
    const title = useRecoilValue(titlebarTitle);
    const user = useRecoilValue(titlebarUser);

    function hide() {
        launcherAPI.window.hide();
    }
    function close() {
        launcherAPI.window.close();
    }
    function historyBack() {
        // this.$router.back();
    }

    return (
        <div className={classes.titlebar}>
            <div className={classes.left}>
                <If state={backBtn.show}>
                    <button className={classes.back} onClick={historyBack}>
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M18.84 10.92V12.92H6.84L12.34 18.42L10.92 19.84L3 11.92L10.92 4L12.34 5.42L6.84 10.92H18.84Z"
                                fill="white"
                            />
                        </svg>
                    </button>
                </If>
                <If state={title.show}>
                    <div className={classes.title}>{title.text}</div>
                </If>
            </div>
            <div className={classes.right}>
                <If state={user.show}>
                    <div className={classes.user}>
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM7.07 18.28C7.5 17.38 10.12 16.5 12 16.5C13.88 16.5 16.5 17.38 16.93 18.28C15.57 19.36 13.86 20 12 20C10.14 20 8.43 19.36 7.07 18.28ZM18.36 16.83C16.93 15.09 13.46 14.5 12 14.5C10.54 14.5 7.07 15.09 5.64 16.83C4.62 15.5 4 13.82 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 13.82 19.38 15.5 18.36 16.83ZM12 6C10.06 6 8.5 7.56 8.5 9.5C8.5 11.44 10.06 13 12 13C13.94 13 15.5 11.44 15.5 9.5C15.5 7.56 13.94 6 12 6ZM12 11C11.6022 11 11.2206 10.842 10.9393 10.5607C10.658 10.2794 10.5 9.89782 10.5 9.5C10.5 9.10218 10.658 8.72064 10.9393 8.43934C11.2206 8.15804 11.6022 8 12 8C12.3978 8 12.7794 8.15804 13.0607 8.43934C13.342 8.72064 13.5 9.10218 13.5 9.5C13.5 9.89782 13.342 10.2794 13.0607 10.5607C12.7794 10.842 12.3978 11 12 11Z"
                                fill="white"
                            />
                        </svg>
                        <div className={classes.username}>{user.username}</div>
                    </div>
                </If>
                <button className={classes.hide} onClick={hide}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M19 13H5V11H19V13Z" fill="white" />
                    </svg>
                </button>
                <button className={classes.close} onClick={close}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M13.46 12L19 17.54V19H17.54L12 13.46L6.46 19H5V17.54L10.54 12L5 6.46V5H6.46L12 10.54L17.54 5H19V6.46L13.46 12Z"
                            fill="white"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
