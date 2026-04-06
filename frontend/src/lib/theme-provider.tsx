import { createContext, useContext, useEffect, useState } from "react";

export type ThemeValue = "light" | "dark" | "system";

// system 테마일 때 OS 설정을 읽어 실제 적용할 테마 결정
function resolveTheme(theme: ThemeValue): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

const ThemeContext = createContext<{
  theme: ThemeValue;
  setTheme: (t: ThemeValue) => void;
}>({ theme: "system", setTheme: () => {} });

/** 앱 최상단을 감싸는 테마 프로바이더. localStorage에 테마를 저장한다. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeValue>(
    () => (localStorage.getItem("theme") as ThemeValue) ?? "system"
  );

  useEffect(() => {
    // html 요소에 dark 클래스를 붙이고 떼는 것으로 Tailwind dark: 변수 전환
    document.documentElement.classList.toggle("dark", resolveTheme(theme) === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (t: ThemeValue) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
