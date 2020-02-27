import { createElement, FC, useState, FormEvent, useContext } from "react";
import { Redirect } from 'react-router-dom';
import { UserData } from "../../server/models/user-model";
import { UserContext } from '../context';

export interface LoginPageProps {
    onSuccess: (user: UserData) => void;
}

export const LoginPage: FC<LoginPageProps> = (props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const user = useContext(UserContext);

    const handleLoginSubmit = (e: FormEvent) => {
        e.preventDefault();
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password: 'fakepass' })
        })
            .then(response => response.json())
            .then(props.onSuccess);
    }

    return !user ? (
        <div className="left-bar">
            <h1>Dev Login</h1>
            <form onSubmit={handleLoginSubmit}>
                <label htmlFor="username">Username</label>
                <input id="username" type="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <label htmlFor="username">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Submit</button>
            </form>
        </div>
    ) : (<Redirect to="/"/>);
}