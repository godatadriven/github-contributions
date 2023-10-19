import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faCodePullRequest } from '@fortawesome/free-solid-svg-icons/faCodePullRequest';
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse';

import Home from '../pages/home/Home.tsx';
import { NonIndexRouteObject } from 'react-router/dist/lib/context';
import PullRequests from '../pages/pull_requests/PullRequests.tsx';
import Trends from '../pages/trends/Trends.tsx';

interface CustomRouteObject extends NonIndexRouteObject {
    icon: IconDefinition;
    path: string;
    label: string;
}

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
    },
    {
        path: '/trends',
        element: <Trends/>,
        icon: faCodePullRequest,
        label: 'Trends',
        id: 'trends'
    }
];

export default routes;