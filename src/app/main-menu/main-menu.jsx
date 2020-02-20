import { useContext, createElement, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context';

export const MainMenu = () => {
    const user = useContext(UserContext);

    return (
        <div className="left-bar">
            <h1>Battlemap Simulator</h1>
            {user ? (
                <Fragment>
                    <Link to="/upload-piece">Upload Piece</Link>
                    <Link to="/rooms">Rooms</Link>
                    <a href="">Logout</a>
                </Fragment>
            ) : (
                <Link to="/login">Login</Link>
            )}
        </div>
    );
}
