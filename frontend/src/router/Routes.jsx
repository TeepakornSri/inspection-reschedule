import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import EquipmentList from '../pages/EquipmentList';
import RequestForm from '../pages/RequestForm';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <MainLayout>
                <EquipmentList />
            </MainLayout>
        ),
    },
    {
        path: '/request',
        element: (
            <MainLayout>
                <RequestForm />
            </MainLayout>
        ),
    },
]);

export default function Routes() {
    return <RouterProvider router={router} />;
}