import { useContext, createElement, Fragment, FC } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context';
import { NavbarList } from '../../components/navbar-list';

export const MainMenu: FC<{}> = () => {
    const user = useContext(UserContext);

    return (
        <div className="left-bar">
            <h2>Main Menu</h2>
            {user ? (
                <NavbarList>
                    <Link to="/pieces">Your Pieces</Link>
                    <Link to="/rooms">Rooms</Link>
                    <Link to="/logout">Logout</Link>
                </NavbarList>
            ) : (
                <Link to="/login">Login</Link>
            )}
        </div>
    );
}
