import { FC } from 'react';
import { LoginPageProps } from './login-page-dev';


/**
 * This exists only to make the Typescript compiler happy with webpack's module replacement.
 */
export const LoginPage: FC<LoginPageProps> = () => {
    return null;
}
