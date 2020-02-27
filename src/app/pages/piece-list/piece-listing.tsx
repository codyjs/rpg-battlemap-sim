import { FC, createElement } from 'react';
import { PieceData } from '../../../server/models/piece-model';

interface PieceListingProps {
    piece: PieceData;
}

export const PieceListing: FC<PieceListingProps> = (props) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'grey' }}>
            <img src={`/images/pieces/${props.piece.image}`} style={{ height: '100px', width: '100px' }} />
            <span>{props.piece.name}</span>
            <button onClick={() => {/* TODO */}}>Delete</button>
        </div>
    );
};