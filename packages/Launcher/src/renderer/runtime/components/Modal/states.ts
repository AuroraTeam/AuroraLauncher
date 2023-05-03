import { ReactNode } from 'react';
import { atom } from 'recoil';

export const modalShow = atom({
    key: 'modal.show',
    default: false,
});

export const modalTitle = atom({
    key: 'modal.title',
    default: 'Modal title',
});

export const modalContent = atom({
    key: 'modal.content',
    default: <ReactNode>'Modal content',
});
