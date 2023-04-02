import { useRouter } from "next/router";
import { type ParsedUrlQuery } from "querystring";
import { useEffect, useState } from "react";
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

	useEffect(() => {
		(async () => {
			if ((await supabaseClient.auth.getUser()).data.user !== null) router.push("/");
		})();
	}, [router, supabaseClient.auth]);

	return (
		<div className="flex flex-col h-full w-full items-center justify-center">
			<h1 className="text-neutral text-3xl mb-4">Welcome</h1>
			<Form
				schema={formSchema}
				onSubmit={async (input) => {
					setErrorMessage(undefined);
					setLoading(true);
					const { data, error } = await supabaseClient.auth.signInWithOtp({
						email: input.email,
						options: {
							emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}${redirectedFrom ?? "/"}`,
						},
					});
					setLoading(false);
					if (error) {
						setErrorMessage(error.message);
						return;
					}

					if (data) router.push("/auth/verify");
				}}
				formProps={{
					showSubmitButton: true,
					className: "flex flex-col items-center",
					submitText: "Sign in",
					loading: loading
				}}
				props={{
					email: {
						wrapperClassName: "mb-4",
						placeholder: "Email address"
					}
				}}
			/>
			{errorMessage}
		</div>
	);
}
