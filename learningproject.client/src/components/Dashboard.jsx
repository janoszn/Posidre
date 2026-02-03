import { LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminContent from './AdminContent';
import StudentContent from './StudentContent';
import TeacherContent from './TeacherContent';

const dashboardByRole = {
    Admin: AdminContent,
    Student: StudentContent,
    Teacher: TeacherContent,
};

const roleColors = {
    Admin: 'destructive',
    Student: 'default',
    Teacher: 'secondary',
};

export default function Dashboard({ user, onLogout }) {
    const role = user?.role;
    const ContentComponent = dashboardByRole[role];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-950 shadow-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <h1 className="text-2xl font-bold">POSIDRE</h1>

                    <div className="flex items-center gap-4">
                        {/* Role badge */}
                        <Badge variant={roleColors[role]}>{role}</Badge>

                        {/* User email */}
                        <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-400">
                            {user?.email}
                        </span>

                        {/* Logout button */}
                        <Button variant="ghost" size="sm" onClick={onLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {ContentComponent ? (
                    <ContentComponent />
                ) : (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg p-4">
                        <p className="text-red-600 dark:text-red-400">Unknown role: {role}</p>
                    </div>
                )}
            </main>
        </div>
    );
}