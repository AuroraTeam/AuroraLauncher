import { ReactElement } from 'react';

interface IfProps {
    state: boolean;
    children: ReactElement;
}

export default function If({ state = false, children }: IfProps) {
    return state ? children : null;
}
