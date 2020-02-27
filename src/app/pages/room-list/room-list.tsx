import { createElement, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RoomListing } from './room-listing';
import { RoomData } from '../../../server/models/room-model';
import { BackButton } from '../../components/back-button';
import { NavbarList } from '../../components/navbar-list';

interface RoomListProps {
    rooms: RoomData[]
}

export const RoomList: FC<RoomListProps> = (props) => {

    const menuList: ReactNode[] = [<BackButton to="/" />];

    if (!props.rooms || props.rooms.length === 0) {
        menuList.push(<p>Loading...</p>);
    } else {
        menuList.push(...props.rooms.map(room => <RoomListing room={room} key={room._id} />))
    }

    menuList.push(<Link to="/create-room">Create Room</Link>);
    
    return (
        <div  style={{display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#55b', width: '200px', marginRight: '10px', padding: '4px'}}>
            <h2>Room List</h2>
            <NavbarList children={menuList} />
        </div>
    );
}