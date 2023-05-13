import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../../assets/images/logo.png';
import { useModal } from '../../components/Modal/hooks';
import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';

export default function Login() {
    const { showModal } = useModal();
    const { setTitlebarUserText, showTitlebarUser } = useTitlebar();
    const navigate = useNavigate();

    const auth = async (event: FormEvent) => {
        event.preventDefault();

        const formData = new FormData(event.target as HTMLFormElement);
        const { login, password } = Object.fromEntries(formData) as Record<
            string,
            string
        >;

        // Валидацию можно делать как хошш))
        // if (login.length < 3)
        //     return showModal(
        //         'Ошибка ввода',
        //         'Логин должен быть не менее 3-ёх символов'
        //     );
        // if (password.length < 8)
        //     return showModal(
        //         'Ошибка ввода',
        //         'Пароль должен быть не менее 8-ми символов'
        //     );
        const auth = await launcherAPI.auth(login, password);
        console.log(auth);

        if (auth instanceof Error) {
            console.log(auth);
            showModal('Ошибка авторизации', auth.message);
            return;
        }

        setTitlebarUserText(auth.username);
        showTitlebarUser();
        localStorage.setItem('username', auth.username); // @deprecated
        localStorage.setItem('userUUID', auth.userUUID); // @deprecated
        localStorage.setItem('accessToken', auth.accessToken); // @deprecated
        // this.$router.push('server-list');
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
