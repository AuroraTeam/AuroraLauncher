import { ReactNode } from 'react';
import { useSetRecoilState } from 'recoil';

import { modalContent, modalShow, modalTitle } from './states';

export function useModal() {
    const setShow = useSetRecoilState(modalShow);
    const setContent = useSetRecoilState(modalContent);
    const setTitle = useSetRecoilState(modalTitle);

    return {
        showModal: (title: string, content: ReactNode) => {
            setTitle(title);
            setContent(content);
            setShow(true);
        },
    };
}
