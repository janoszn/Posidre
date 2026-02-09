import { LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminContent from './AdminContent';
import StudentContent from './StudentContent';
import TeacherContent from './TeacherContent';
import SchoolAdminContent from './SchoolAdminContent';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';

const dashboardByRole = {
    Admin: AdminContent,
    Student: StudentContent,
    Teacher: TeacherContent,
    SchoolAdmin: SchoolAdminContent,
};

const roleColors = {
    Admin: 'destructive',
    Student: 'default',
    Teacher: 'secondary',
    SchoolAdmin: 'default', // NEW - or choose a different color
};

const roleTitles = {
    Admin: 'Administrateur',
    Student: 'Étudiant',
    Teacher: 'Enseignant',
    SchoolAdmin: 'Admin Scolaire', // NEW
};

export default function Dashboard({ user, onLogout }) {
    const role = user?.role;
    const ContentComponent = dashboardByRole[role];

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <h1 className="text-2xl font-bold">POSIDRE</h1>

                    <div className="flex items-center gap-4">
                        <Badge variant={roleColors[role]}>
                            {roleTitles[role] || role}
                        </Badge>

                        <span className="hidden sm:inline text-sm text-muted-foreground">
                            {user?.email}
                        </span>

                        <ColorModeIconDropdown />

                        <Button variant="ghost" size="sm" onClick={onLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {ContentComponent ? (
                    <ContentComponent />
                ) : (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p className="text-destructive">Unknown role: {role}</p>
                    </div>
                )}
            </main>
        </div>
    );
}