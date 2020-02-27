import { FC, createElement, useContext, Fragment, useEffect, useState } from 'react';
import { UserContext } from "../../context";
import { Link, Redirect } from 'react-router-dom';
import { PieceData } from '../../../server/models/piece-model';
import { PieceListing } from './piece-listing';
import { BackButton } from '../../components/back-button/back-button';
import { NavbarList } from '../../components/navbar-list';

export const Pieces: FC<{}> = () => {
    const user = useContext(UserContext);
    const [pieces, setPieces] = useState<PieceData[]>([]);

    if (!user) return <Redirect to="/" />;

    useEffect(() => {
        fetch('/api/pieces')
            .then(response => response.json())
            .then(setPieces);
    }, []);

    return (
        <Fragment>
            <div className="left-bar">
                <h2>Your Pieces</h2>
                <NavbarList>
                    <BackButton to="/" />
                    <Link to="/upload-piece">Upload Piece</Link>
                </NavbarList>
            </div>
            <div style={{display: 'grid', flexGrow: 1, gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gridGap: '10px'}}>
                {pieces.map(piece => <PieceListing key={piece._id} piece={piece} />)}
            </div>
        </Fragment>
    );
}
