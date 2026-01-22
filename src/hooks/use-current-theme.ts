import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

 export const useCurrentTheme = () => {
    const [mounted, setMounted] = useState(false);
    const {theme, systemTheme} = useTheme()
     
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
     
    if (theme === "dark" || theme === "light"){
        return theme
    }

    return systemTheme;
}