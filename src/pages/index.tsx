import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Form } from "../components/form/Form";
import { api } from "../utils/api";

const schema = z.object({ prompt: z.string() });

export default function Home() {
	const mutation = api.generate.single.useMutation();
	const [result, setResult] = useState<string>();
	return (
		<>
			<Link href="/expenses">Expenses (example)</Link>
			<div className="px-4 pt-4">
				<h1 className="text-4xl">STORIESY</h1>
				<Form
					schema={schema}
					onSubmit={async (output) => {
						setResult(await await mutation.mutateAsync(output));
					}}
				/>
				{mutation.isLoading && <p>Loading...</p>}
				{result}
			</div>
		</>
	);
}
