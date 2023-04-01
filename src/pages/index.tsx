import Image from "next/image";
import { useState } from "react";
import { z } from "zod";
import { Form } from "../components/form/Form";
import { api, type RouterOutputs } from "../utils/api";

const schema = z.object({ prompt: z.string(), model: z.enum(["dalle", "stablediffusion"]) });

export default function Home() {
	const mutation = api.generate.single.useMutation();
	const [result, setResult] = useState<RouterOutputs["generate"]["single"]>();
	return (
		<>
			<div className="flex h-full flex-col justify-between p-8">
				<h1 className="text-4xl text-neutral">New comic</h1>
				<div className="mt-8 mb-8 h-full overflow-y-scroll rounded-lg border-2 border-gray-300 px-6 py-4">
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
								scene.imageSrc.type === "url" ? (
									<>
										{scene.imageSrc.url ? (
											<Image
												src={scene.imageSrc.url}
												alt="AI generated image"
												width={512}
												height={512}
											/>
										) : (
											"malformed url"
										)}
									</>
								) : (
									<>
										{scene.imageSrc.data ? (
											<Image src={scene.imageSrc.data} alt="AI generated image" />
										) : (
											"malformed data"
										)}
									</>
								)
							) : (
								`bad image url ${scene.imageSrc}`
							)}
						</div>
					))}
				</div>
				<div>Comic main character and story description</div>
				<Form
					schema={schema}
					onSubmit={async (output) => {
						setResult(undefined); // Hide previous result
						setResult(await mutation.mutateAsync(output));
					}}
					props={{
						prompt: {
							placeholder: "Type your comic description..",
							className:
								"border-2 bg-white text-neutral w-full border-gray-300 focus:outline-0 focus:border-primary disabled:bg-gray-300 disabled:text-white disabled:border-gray-300",
							disabled: mutation.isLoading,
						},
						model: {
							options: ["dalle", "stablediffusion"],
						},
					}}
					formProps={{ className: "w-full flex gap-2" }}
				/>
			</div>
		</>
	);
}
