import { ReactNode, createElement, FC } from 'react';

interface NavbarListProps {
    children: ReactNode[];
}

export const NavbarList: FC<NavbarListProps> = (props) => {
    return (
        <ul style={{listStyle: 'none', paddingLeft: '0'}}>
            {props.children.map((child, index) => (
                child ? <li key={index} style={{marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #5475a0', textAlign: 'center'}}>{child}</li> : null
            ))}
        </ul>
    );
};