import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from '../router/routes.tsx';

const router = createBrowserRouter(routes, {
    basename: '/github-contributions'
});

function Router() {
    return <RouterProvider router={router}/>;
}

export default Router;