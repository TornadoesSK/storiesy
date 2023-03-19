import { type SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { createContext, useContext } from "react";
import { useAuth } from "./auth/useAuth";

export function useApp() {
	return useAuth();
}

export const appStateContext = createContext<{ supabaseClient: SupabaseClient } | null>(null);

export const useAppState = () => {
	const appState = useContext(appStateContext);
	if (appState === null) throw new Error();
	return appState;
};
