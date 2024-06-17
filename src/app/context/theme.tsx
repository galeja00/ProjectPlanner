"use client"


import React, { createContext, useState, useEffect } from 'react';

//const ThemeContext = createContext();

interface ThemeContextType {
    theme : Theme,
    toggleTheme : () => void
}

enum Theme {
    ligth = "light",
    dark = "dark"
}


const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({children} : {children: React.ReactNode}) {
    const [ theme, setTheme ] = useState<Theme>(Theme.ligth);

    useEffect(() => {
        const storedTheme  = localStorage.getItem('theme') as Theme | null;
        if (storedTheme && (storedTheme == Theme.ligth || storedTheme == Theme.dark)) {
            setTheme(storedTheme);
        } else {
            const prefersDark : boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? Theme.dark : Theme.ligth);
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('theme', theme.toString());
    }, [theme])

    function toggleTheme() {
        setTheme(theme == Theme.ligth ? Theme.dark : Theme.ligth);
    }

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}