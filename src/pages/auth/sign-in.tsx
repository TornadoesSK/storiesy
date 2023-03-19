import { useRouter } from "next/router";
import { type ParsedUrlQuery } from "querystring";
import { useState } from "react";
import { z } from "zod";
import { Form } from "../../components/form/Form";
import { env } from "../../env/client.mjs";
import { useAppState } from "../../components/useAppState";

const formSchema = z.object({
	email: z.string().email(),
});

const parseSearchParams = (query: ParsedUrlQuery) => {
	const result = z.object({ redirectedFrom: z.string() }).safeParse(query);
	return result.success ? result.data : null;
};

export default function SignIn() {
	const [errorMessage, setErrorMessage] = useState<string>();
	const [loading, setLoading] = useState(false);

	const router = useRouter();
	const { supabaseClient } = useAppState();

	const redirectedFrom = parseSearchParams(router.query)?.redirectedFrom;

	// TODO: Redirect to root if already signed in

	return (
		<div>
			<div>Sign in</div>
			<Form
				schema={formSchema}
				onSubmit={async (input) => {
					setErrorMessage(undefined);
					setLoading(true);
					const { data, error } = await supabaseClient.auth.signInWithOtp({
						email: input.email,
						options: {
							emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}${redirectedFrom ?? "/auth/success"}`,
						},
					});
					setLoading(false);
					if (error) {
						setErrorMessage(error.message);
						return;
					}

					if (data) router.push("/auth/verify");
				}}
			/>
			{loading && "loading"}
			{errorMessage}
		</div>
	);
}
