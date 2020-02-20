import { createContext } from 'react';
import { UserData } from '../server/models/user-model';

export const UserContext = createContext<UserData>(null);
