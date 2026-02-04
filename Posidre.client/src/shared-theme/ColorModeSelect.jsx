import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ColorModeSelect({ className }) {
    const [mode, setMode] = useState('light');

    useEffect(() => {
        // Check localStorage and system preference on mount
        const savedMode = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedMode) {
            setMode(savedMode);
            applyTheme(savedMode, systemDark);
        } else {
            setMode('system');
            applyTheme('system', systemDark);
        }
    }, []);

    const applyTheme = (theme, systemDark) => {
        if (theme === 'dark' || (theme === 'system' && systemDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleChange = (value) => {
        setMode(value);
        localStorage.setItem('theme', value);

        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(value, systemDark);
    };

    return (
        <Select value={mode} onValueChange={handleChange}>
            <SelectTrigger className={className}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
        </Select>
    );
}