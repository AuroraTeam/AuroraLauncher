import { Outlet } from 'react-router-dom';

import Modal from './Modal';
import TitleBar from './TitleBar';

export default function Layout() {
    return (
        <>
            <TitleBar />
            <main>
                <Outlet />
            </main>
            <Modal />
        </>
    );
}
