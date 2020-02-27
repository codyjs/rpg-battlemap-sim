import { FC, createElement, useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';

interface LogoutProps {
    onSuccess: () => void;
}

export const Logout: FC<LogoutProps> = (props) => {
    const [loggingOut, setLoggingOut] = useState(true);

    useEffect(() => {
        fetch('/api/logout')
            .then(response => {
                setLoggingOut(false);
                if (response.ok) {
                    props.onSuccess();
                }
            });
    }, []);

    return loggingOut ? <h2>Logging you out...</h2> : <Redirect to="/" />;
};
