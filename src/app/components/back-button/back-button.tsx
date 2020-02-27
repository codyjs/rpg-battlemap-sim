import { FC, createElement } from 'react';
import { Link } from 'react-router-dom';

interface BackButtonProps {
    to: string;
}

export const BackButton: FC<BackButtonProps> = (props) => {
    return (
        <Link to={props.to}>&lt;&lt; Back</Link>
    );
};
