import { useState } from 'react';
import AdminContent from './AdminContent';
import TeacherContent from './TeacherContent';
import PassationDashboard from './PassationDashboard';
import { Button } from "@/components/ui/button";
import { LogOut, User } from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
    const dashboardByRole = {
        Admin: AdminContent,
        Teacher: TeacherContent,
        SchoolAdmin: PassationDashboard,
    };

    //const roleColors = {
    //    Admin: 'destructive',
    //    Teacher: 'default',
    //    SchoolAdmin: 'default',
    //};

    const roleTitles = {
        Admin: 'Administrateur',
        Teacher: 'Enseignant',
        SchoolAdmin: 'Admin Scolaire',
    };

    const DashboardContent = dashboardByRole[user.role];

    if (!DashboardContent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-destructive">Rôle non reconnu: {user.role}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">POSIDRE</h1>
                                <p className="text-sm text-muted-foreground">
                                    Système de gestion TEDP 2.0
                                </p>
                            </div>
                        </div>

                        {/* User Info & Logout */}
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium">{user.email}</p>
                                <p className="text-xs text-muted-foreground">
                                    {roleTitles[user.role]}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLogout}
                                    className="gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Déconnexion</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <DashboardContent user={user} />
            </main>

            {/* Footer */}
            <footer className="border-t bg-card mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                    <p>© 2025 POSIDRE - Système TEDP 2.0</p>
                </div>
            </footer>
        </div>
    );
}