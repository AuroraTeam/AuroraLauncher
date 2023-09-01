import { Profile, Server } from '@aurora-launcher/core';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

import If from '../../components/If';
import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';
import { LoadProgress } from '../../../../common/types';

export default function ServerPanel() {
    const [selectedProfile, setSelectedProfile] = useState({} as Profile);
    const [selectedServer, setSelectedServer] = useState({} as Server);

    const [console, setConsole] = useState('');
    const [showProgress, setShowProgress] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const consoleRef = useRef() as MutableRefObject<HTMLPreElement>;
    const progressLine = useRef() as MutableRefObject<HTMLDivElement>;
    const progressInfo = useRef() as MutableRefObject<HTMLDivElement>;

    const { showTitlebarBackBtn } = useTitlebar();

    useEffect(() => {
        launcherAPI.scenes.serverPanel.getProfile().then(setSelectedProfile);
        launcherAPI.scenes.serverPanel.getServer().then(setSelectedServer);

        showTitlebarBackBtn();
    }, []);

    const startGame = () => {
        setConsole('');
        setShowProgress(true);
        setGameStarted(true);
        launcherAPI.scenes.serverPanel.startGame(textToConsole, progress, () =>
            setGameStarted(false),
        );
    };

    const textToConsole = (string: string) => {
        setConsole((console) => console + string);

        const consoleEl = consoleRef.current;
        if (!consoleEl) return;
        // Если не оборачивать в setTimeout, то оно прокручивает не до конца
        setTimeout(() => {
            consoleEl.scrollTop = consoleEl.scrollHeight;
        }, 1);
    };

    const progress = ({ total, loaded }: LoadProgress) => {
        if (!progressLine.current) return;

        const percent = (loaded / total) * 100;

        progressLine.current.style.width = percent + '%';
        setShowProgress(percent < 100);

        progressInfo.current.innerHTML = `Загружено ${bytesToSize(
            loaded,
        )} из ${bytesToSize(total)}`;
    };

    return (
        <div className={classes.window}>
            <div className={classes.info}>
                <div>
                    <div className={classes.title}>{selectedServer.title}</div>
                    <div>{selectedProfile.version}</div>
                </div>
                <div className={classes.status}>
                    <div className={classes.gamers}>
                        Игроков
                        <br />
                        онлайн
                    </div>
                    <div className={classes.line}></div>
                    <div className={classes.count}>
                        10
                        <div className={classes.total}>из 100</div>
                    </div>
                </div>
            </div>
            <div className={classes.buttons}>
                <button onClick={startGame} disabled={gameStarted}>
                    Играть
                </button>
                <button>Настройки</button>
            </div>
            <If state={showProgress}>
                <>
                    <div className={classes.progress}>
                        <div
                            className={classes['progress-line']}
                            ref={progressLine}
                        ></div>
                    </div>
                    <div
                        className={classes['progress-info']}
                        ref={progressInfo}
                    ></div>
                </>
            </If>
            <If state={console.length > 0}>
                <pre className={classes.console} ref={consoleRef}>
                    {console}
                </pre>
            </If>
        </div>
    );
}

function bytesToSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB'];
    if (bytes === 0) return 'n/a';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i === 0) return `${bytes} ${sizes[i]})`;
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}
