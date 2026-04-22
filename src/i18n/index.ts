import { createContext, useCallback, useContext, useMemo, useState, type ReactNode, createElement } from "react";
import type { Item } from "../types";
import fr from "./fr.json";
import he from "./he.json";

export type Locale = "fr" | "he";

type Translations = typeof fr;

const LOCALES: Partial<Record<Locale, Translations>> = { fr, he };

const LOCALE_KEY = "locale";

function interpolate(str: string, params?: Record<string, string | number>): string {
    if (!params) return str;
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? `{{${key}}}`));
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
        if (current == null || typeof current !== "object") return undefined;
        current = (current as Record<string, unknown>)[part];
    }
    return typeof current === "string" ? current : undefined;
}

type I18nContextValue = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
    children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(() => {
        const stored = localStorage.getItem(LOCALE_KEY);
        return stored === "he" ? "he" : "fr";
    });

    function setLocale(next: Locale) {
        localStorage.setItem(LOCALE_KEY, next);
        setLocaleState(next);
    }

    function t(key: string, params?: Record<string, string | number>): string {
        const translations = LOCALES[locale] ?? LOCALES.fr;
        const value = getNestedValue(translations as unknown as Record<string, unknown>, key);
        if (value !== undefined) return interpolate(value, params);

        // fallback to fr
        const fallback = getNestedValue(fr as unknown as Record<string, unknown>, key);
        if (fallback !== undefined) return interpolate(fallback, params);

        return key;
    }

    return createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
}

export function useTranslation() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error("useTranslation must be used inside I18nProvider");
    return ctx;
}

export function useLocalizeItem() {
    const { locale } = useTranslation();

    const localName = useCallback(
        (item: Item) =>
            locale === "he" && item.name_he && item.name_he.trim().length > 0 ? item.name_he : item.name,
        [locale],
    );

    const localNote = useCallback(
        (item: Item) => {
            if (locale !== "he") return item.note;
            if (item.note_he && item.note_he.trim().length > 0) return item.note_he;
            return item.note;
        },
        [locale],
    );

    return useMemo(() => ({ localName, localNote }), [localName, localNote]);
}
