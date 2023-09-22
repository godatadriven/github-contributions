import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from '../router/routes.tsx';

const router = createBrowserRouter(routes);

function Router() {
    return <RouterProvider router={router}/>;
}

export default Router;