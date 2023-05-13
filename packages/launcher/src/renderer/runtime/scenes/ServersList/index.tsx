import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ServerButton } from '../../components/ServerButton';
import SkinView from '../../components/SkinView';
import classes from './index.module.sass';

interface Server {
    [key: string]: any;
}

export default function ServersList() {
    const [servers, setServers] = useState<Server[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        launcherAPI.api.getServers().then(setServers);
    }, []);

    const selectProfile = (profile: object) => {
        localStorage.setItem('selectedProfile', JSON.stringify(profile));
        navigate('/ServerPanel');
    };

    return (
        <div className={classes.window}>
            <div className={classes.skinView}>
                <SkinView />
            </div>
            <div className={classes.serverList}>
                {servers.map((server, i) => (
                    <ServerButton
                        key={i}
                        server={server}
                        onClick={() => selectProfile(server)}
                    />
                ))}
            </div>
        </div>
    );
}
