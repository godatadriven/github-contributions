import { RouterProvider, createHashRouter } from 'react-router-dom';
import routes from '../router/routes.tsx';

const router = createHashRouter(routes);

function Router() {
    return <RouterProvider router={router}/>;
}

export default Router;