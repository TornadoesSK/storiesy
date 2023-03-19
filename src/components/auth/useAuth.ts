import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
	const [supabaseClient] = useState(() => createBrowserSupabaseClient());
	supabaseClient.auth.onAuthStateChange(async (event, session) => {
		switch (event) {
			case "SIGNED_IN":
			case "TOKEN_REFRESHED":
				if (session) {
					sessionStorage.setItem("sb-access-token", session.access_token);
					sessionStorage.setItem("sb-refresh-token", session.refresh_token);
				}
				break;
			case "SIGNED_OUT":
			case "USER_DELETED":
				sessionStorage.removeItem("sb-access-token");
				sessionStorage.removeItem("sb-refresh-token");
		}
	});

	const setSession = useCallback(async () => {
		const access_token = sessionStorage.getItem("sb-access-token");
		const refresh_token = sessionStorage.getItem("sb-refresh-token");
		if (access_token && refresh_token) {
			await supabaseClient.auth.setSession({
				access_token,
				refresh_token,
			});
		}
	}, [supabaseClient]);

	useEffect(() => {
		setSession();
	});

	return { supabaseClient };
}
