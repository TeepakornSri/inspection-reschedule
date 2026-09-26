import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import EquipmentList from '../pages/EquipmentList';
import RequestForm from '../pages/RequestForm';
import PendingList from '../pages/PendingList';
import HistoryList from '../pages/HistoryList';

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
       {
        path: '/pending',
        element: (
            <MainLayout>
                <PendingList />
            </MainLayout>
        ),
    },
           {
        path: '/history',
        element: (
            <MainLayout>
                <HistoryList />
            </MainLayout>
        ),
    },
]);

export default function Routes() {
    return <RouterProvider router={router} />;
}