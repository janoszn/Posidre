import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ColorModeIconDropdown({ className }) {
    const [mode, setMode] = useState('light');

    useEffect(() => {
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

    const handleModeChange = (newMode) => {
        setMode(newMode);
        localStorage.setItem('theme', newMode);

        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(newMode, systemDark);
    };

    const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={className}>
                    <Icon className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleModeChange('system')}>
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeChange('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeChange('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}