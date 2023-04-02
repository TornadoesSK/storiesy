import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAppState } from "../../components/useAppState";

export default function Landing() {
	const { supabaseClient } = useAppState();
	const router = useRouter();
	useEffect(() => {
		(async () => {
			if ((await supabaseClient.auth.getUser()).data.user !== null) router.push("/");
		})();
	}, [router, supabaseClient.auth]);

	return <div>ahoj</div>;
}
