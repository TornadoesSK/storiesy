import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Form } from "../components/form/Form";
import { api, type RouterOutputs } from "../utils/api";

const schema = z.object({ prompt: z.string() });

export default function Home() {
	const mutation = api.generate.single.useMutation();
	const [result, setResult] = useState<RouterOutputs["generate"]["single"]>();
	return (
		<>
			<Link href="/expenses">Expenses (example)</Link>
			<div className="px-4 pt-4">
				<h1 className="text-4xl">STORIESY</h1>
				<Form
					schema={schema}
					onSubmit={async (output) => {
						setResult(undefined);
						setResult(await mutation.mutateAsync(output));
					}}
				/>
				{mutation.isLoading && <p>Loading...</p>}
				{result?.scenes.map((scene, idx) => (
					<div key={idx} className="pb-4">
						<div className="italic">{scene.imagePrompt}</div>
						{scene.speechBubble && (
							<div>
								<span className="font-medium">{scene.speechBubble.characterName}</span>:{" "}
								<span>{scene.speechBubble.text}</span>
							</div>
						)}
						{scene.imageSrc ? (
							<Image src={scene.imageSrc} alt="AI generated image" width={512} height={512} />
						) : (
							`bad image url ${scene.imageSrc}`
						)}
					</div>
				))}
			</div>
		</>
	);
}
