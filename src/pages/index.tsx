import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { z } from "zod";
import { Form } from "../components/form/Form";
import { api } from "../utils/api";

const schema = z.object({
	prompt: z.string(),
	model: z.enum(["dalle", "stablediffusion"]),
	sceneCount: z.number().optional(),
});

const maxRetries = 3;

export default function Home() {
	const configMutation = api.generate.imageConfig.useMutation();
	const imagesMutation = api.generate.images.useMutation();
	const loading = configMutation.isLoading || imagesMutation.isLoading;
	const organization = api.organization.get.useQuery();
	const router = useRouter();
	const [retried, setRetried] = useState(false);

	useEffect(() => {
		if (organization.data === null) {
			router.push("/organization");
		}
	}, [organization.data, router]);

	return (
		<>
			<div className="flex h-full flex-col justify-between p-8">
				<div className="flex w-full items-center justify-between">
					<h1 className="text-4xl text-neutral">New comic</h1>
					{organization.data?.logo && (
						// eslint-disable-next-line @next/next/no-img-element
						<img className="max-w-[150px]" src={organization.data.logo} alt="company logo" />
					)}
				</div>
				<div className="mt-8 mb-8 h-full overflow-y-scroll rounded-lg px-6 py-4 text-neutral shadow-xl">
					{configMutation.isLoading && <p>Loading config...</p>}
					{retried && <p>Retrying...</p>}
					{imagesMutation.isLoading && <p>Loading images...</p>}
					{imagesMutation.data && (
						<div className="pb-4">
							<Image
								src={`data:image/png;base64,${imagesMutation.data}`}
								alt="AI generated image"
								width={512}
								height={512}
							/>
						</div>
					)}
				</div>
				<Form
					schema={schema}
					onSubmit={async (output) => {
						configMutation.reset();
						imagesMutation.reset();
						let config;
						for (let i = 0; i < maxRetries; i++) {
							try {
								config = await configMutation.mutateAsync({
									prompt: output.prompt,
									sceneCount: output.sceneCount,
								});
								if (config) break;
								setRetried(true);
							} finally {
								setRetried(false);
							}
						}
						if (!config) return;
						await imagesMutation.mutateAsync({
							...config,
							model: output.model,
							sceneLimit: output.sceneCount,
						});
					}}
					props={{
						prompt: {
							placeholder: "Type your comic description..",
							disabled: loading,
							labelText: "Comic main character and story description",
							wrapperClassName: "grow",
							className: "w-full",
						},
						model: {
							options: ["dalle", "stablediffusion"],
							disabled: loading,
							labelText: "Select image model",
							className: "w-full",
						},
						sceneCount: {
							disabled: loading,
							labelText: "Max number of scenes",
							placeholder: "Number",
							className: "w-full",
						},
					}}
					formProps={{
						className: "w-full flex items-end gap-2",
						showSubmitButton: true,
						loading: loading,
					}}
				/>
			</div>
		</>
	);
}
