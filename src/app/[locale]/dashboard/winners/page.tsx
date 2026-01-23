import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import WinnersClient from './WinnersClient';

export default async function WinnersPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/fr/login');
    }

    return <WinnersClient />;
}
