import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { RouteObject } from 'react-router-dom';
import { faCodePullRequest } from '@fortawesome/free-solid-svg-icons/faCodePullRequest';
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse';

import Home from '../pages/home/Home.tsx';
import PullRequests from '../pages/pull_requests/PullRequests.tsx';

export type CustomRouteObject = RouteObject & {
    id: string;
    icon: IconDefinition;
    path: string;
    label: string;
};

const routes: CustomRouteObject[] = [
    {
        path: '/',
        element: <Home/>,
        icon: faHouse,
        label: 'Home',
        id: 'home'
    },
    {
        path: '/pull_requests',
        element: <PullRequests/>,
        icon: faCodePullRequest,
        label: 'Pull Requests',
        id: 'pull_request'
    }
];

export default routes;