import { createElement } from 'react';
import { Link } from 'react-router-dom';

export const MainMenu = (props) => {
    
    return (
        <div className="left-bar">
            <h1>Battlemap Simulator</h1>
            <Link to="/upload-image">Upload Image</Link>
            <Link to="/rooms">Rooms</Link>
        </div>
    );
}
