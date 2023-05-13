import { MutableRefObject, useEffect, useRef } from 'react';
import { SkinViewer, WalkingAnimation } from 'skinview3d';

import defaultSkin from '../assets/images/steve.png';

export default function SkinView() {
    const skinCanvas = useRef() as MutableRefObject<HTMLCanvasElement>;

    useEffect(() => {
        const skinViewer = new SkinViewer({
            canvas: skinCanvas.current,
            width: 220,
            height: 440,
            skin: defaultSkin,
            enableControls: false,
        });

        skinViewer.camera.position.x = -25;
        skinViewer.camera.position.y = 18;
        skinViewer.camera.position.z = 46;
        skinViewer.zoom = 0.8;

        skinViewer.animation = new WalkingAnimation();
        skinViewer.animation.speed = 0.5;
    }, []);

    return <canvas ref={skinCanvas} />;
}
