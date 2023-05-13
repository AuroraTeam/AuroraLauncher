import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import Modal from '../Modal';
import { useModal } from '../Modal/hooks';
import TitleBar from '../TitleBar';
import classes from './index.module.sass';

export default function Layout() {
    const [inactive, setInactive] = useState(true);
    const { showModal } = useModal();

    useEffect(() => {
        launcherAPI.api.getStatus().then((status) => {
            console.log(status);

            switch (status) {
                case 'connected':
                    setInactive(false);
                    break;
                case 'connecting':
                    // TODO ?
                    showModal(
                        'Неожиданная ошибка',
                        <>
                            Если вы увидели эту ошибку, сообщите разработчику
                            <br />
                            прикрепив скриншот окна лаунчера
                        </>
                    );
                    break;
                case 'failure':
                    showModal('Ошибка подключения!', 'Сервер недоступен');
            }
        });
    }, []);

    return (
        <>
            <TitleBar />
            <main className={`${inactive ? classes.inactive : ''}`}>
                <Outlet />
            </main>
            <Modal />
        </>
    );
}
