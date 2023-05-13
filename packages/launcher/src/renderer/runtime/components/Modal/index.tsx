import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import classes from './index.module.sass';
import { modalContent, modalShow, modalTitle } from './states';

export default function Modal() {
    const [show, setShow] = useRecoilState(modalShow);
    const content = useRecoilValue(modalContent);
    const title = useRecoilValue(modalTitle);

    function closeModal() {
        setShow(false);
    }

    const closeOnEscapeKeyDown = (event: KeyboardEvent) => {
        if (event.code === 'Escape' || event.key === 'Escape') closeModal();
    };

    useEffect(() => {
        document.addEventListener('keydown', closeOnEscapeKeyDown);
        return () =>
            document.removeEventListener('keydown', closeOnEscapeKeyDown);
    }, []);

    return (
        <div className={`${classes.modalOverlay} ${show ? classes.show : ''}`}>
            <div className={classes.modal}>
                <div className={classes.title}>{title}</div>
                <div className={classes.content}>{content}</div>
                <button className={classes.button} onClick={closeModal}>
                    ОK
                </button>
            </div>
        </div>
    );
}
