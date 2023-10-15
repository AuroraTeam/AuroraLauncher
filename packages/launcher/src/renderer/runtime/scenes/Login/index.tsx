import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../../assets/images/logo.png';
import { useModal } from '../../components/Modal/hooks';
import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';

interface AuthData {
    [k: string]: string;
    login: string;
    password: string;
}

export default function Login() {
    const { showModal } = useModal();
    const { setTitlebarUserText, showTitlebarUser } = useTitlebar();
    const navigate = useNavigate();

    const auth = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const { login, password } = Object.fromEntries(formData) as AuthData;

        // Валидацию можно делать как хошш))
        if (login.length < 3) {
            return showModal(
                'Ошибка ввода',
                'Логин должен быть не менее 3-ёх символов',
            );
        }
        // if (password.length < 8) {
        //     return showModal(
        //         'Ошибка ввода',
        //         'Пароль должен быть не менее 8-ми символов'
        //     );
        // }

        let userData;
        try {
            userData = await launcherAPI.scenes.login.auth(login, password);
        } catch (error) {
            console.error(error);
            showModal('Ошибка авторизации', (error as Error).message);
            return;
        }

        setTitlebarUserText(userData.username);
        showTitlebarUser();
        navigate('ServersList');
    };

    return (
        <div className={classes.block}>
            <img src={logo} />
            <div>Aurora Launcher</div>
            <p>
                Введите логин и пароль,
                <br />
                чтобы продолжить
            </p>
            <form onSubmit={auth}>
                <input type="text" placeholder="Логин" name="login" />
                <input type="password" placeholder="Пароль" name="password" />
                <button>Войти</button>
            </form>
        </div>
    );
}
