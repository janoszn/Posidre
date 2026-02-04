import SignInCard from './components/SignInCard';
import { GraduationCap, FilePen, Users, Award } from 'lucide-react';

export default function SignInSide({ onLoginSuccess, onShowSignUp, onEnterIdQuestionnaire }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-950 p-4 relative overflow-hidden">
            {/* Decorative background elements - MORE VISIBLE in light mode */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 dark:bg-primary/40 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/15 dark:bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-300/10 dark:bg-amber-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative z-10">
                {/* Content/branding section */}
                <div className="flex-1 max-w-md text-center md:text-left space-y-6">
                    {/* Logo/Icon */}
                    <div className="inline-flex items-center justify-center md:justify-start">
                        <div className="bg-gradient-to-br from-primary/20 to-orange-400/20 p-4 rounded-2xl shadow-lg shadow-primary/10">
                            <GraduationCap className="h-12 w-12 text-primary" />
                        </div>
                    </div>

                    {/* Title with gradient */}
                    <div>
                        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                            POSIDRE
                        </h1>
                        <p className="text-xl text-slate-700 dark:text-slate-300 font-medium">
                            Portail des outils de suivi des indicateurs et déterminants de la réussite éducative
                        </p>
                    </div>

                    {/* Feature highlights */}
                    <div className="grid grid-cols-1 gap-3 pt-4">
                        <div className="flex items-center gap-3 text-left">
                            <div className="bg-gradient-to-br from-primary/20 to-orange-400/20 p-2 rounded-lg">
                                <FilePen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Questionnaire TEDP2.0
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-left">
                            <div className="bg-gradient-to-br from-primary/20 to-orange-400/20 p-2 rounded-lg">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Collaboration enseignants-élèves
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-left">
                            <div className="bg-gradient-to-br from-primary/20 to-orange-400/20 p-2 rounded-lg">
                                <Award className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Analyse des résultats
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sign in card */}
                <div className="w-full max-w-md">
                    <SignInCard
                        onLoginSuccess={onLoginSuccess}
                        onShowSignUp={onShowSignUp}
                        onEnterIdQuestionnaire={onEnterIdQuestionnaire}
                    />
                </div>
            </div>
        </div>
    );
}