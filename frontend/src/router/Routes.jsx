import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import EquipmentList from '../pages/EquipmentList';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <MainLayout>
                <EquipmentList />
            </MainLayout>
        ),
    },
]);

export default function Routes() {
    return <RouterProvider router={router} />;
}