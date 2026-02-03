import SignInCard from './components/SignInCard';

export default function SignInSide({ onLoginSuccess, onShowSignUp, onEnterIdQuestionnaire }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                {/* Content/branding section - you can customize this */}
                <div className="flex-1 max-w-md text-center md:text-left">
                    <h1 className="text-4xl font-bold mb-4">Welcome to POSIDRE</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Your learning platform for surveys and questionnaires
                    </p>
                </div>

                {/* Sign in card */}
                <SignInCard
                    onLoginSuccess={onLoginSuccess}
                    onShowSignUp={onShowSignUp}
                    onEnterIdQuestionnaire={onEnterIdQuestionnaire}
                />
            </div>
        </div>
    );
}