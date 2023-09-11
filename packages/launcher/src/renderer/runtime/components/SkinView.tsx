import { MutableRefObject, useEffect, useRef } from 'react';
import { SkinViewer, WalkingAnimation, createOrbitControls } from 'skinview3d';

import defaultSkin from '../assets/images/steve.png';

export default function SkinView() {
    const skinCanvas = useRef() as MutableRefObject<HTMLCanvasElement>;

    useEffect(() => {
        const skinViewer = new SkinViewer({
            canvas: skinCanvas.current,
            width: 220,
            height: 440,
            skin: defaultSkin,
        });

        skinViewer.camera.position.x = -20;
        skinViewer.camera.position.y = 20;
        skinViewer.zoom = 0.8;

        skinViewer.animations.add(WalkingAnimation);
        skinViewer.animations.speed = 0.6;

        const control = createOrbitControls(skinViewer);
        control.enableRotate = true;
        control.enableZoom = false;
    }, []);

    return <canvas ref={skinCanvas} />;
}
