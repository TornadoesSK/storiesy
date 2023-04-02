import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { z } from "zod";
import { Form } from "../components/form/Form";
import { api } from "../utils/api";
import { isTruthy } from "../utils/isTruthy";
import { joinImagesFE } from "../utils/loadImageFE";
import { useForm } from "../components/form/useForm";

const schema = z.object({
	prompt: z.string(),
	model: z.enum(["dalle", "stablediffusion"]),
	sceneCount: z.number().optional(),
});

const editSchema = z.object({
	changes: z.array(
		z.object({
			changeImage: z.boolean(),
			text: z.string(),
		}),
	),
});

const maxRetries = 3;

export default function Home() {
	const configMutation = api.generate.imageConfig.useMutation();
	const imagesMutation = api.generate.images.useMutation();
	const loading = configMutation.isLoading || imagesMutation.isLoading;
	const organization = api.organization.get.useQuery();
	const router = useRouter();
	const [_images, setImages] = useState<typeof imagesMutation.data>();
	const [fullImage, setFullImage] = useState<string>();
	const [retried, setRetried] = useState(false);
	const editForm = useForm({
		schema: editSchema,
	});

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
				<div className="mt-8 mb-8 flex h-full justify-between overflow-y-scroll rounded-lg px-6 py-4 text-neutral shadow-xl">
					<div>
						{configMutation.isLoading && <p>Loading config...</p>}
						{retried && <p>Retrying...</p>}
						{imagesMutation.isLoading && <p>Loading images...</p>}
						{fullImage && (
							<div className="pb-4">
								<Image
									src={`data:image/png;base64,${fullImage}`}
									alt="AI generated image"
									width={512}
									height={512}
								/>
							</div>
						)}
					</div>
					<Form
						form={editForm}
						schema={editSchema}
						onSubmit={async (output) => {
							console.log(output);
						}}
						formProps={{ showSubmitButton: true }}
					/>
				</div>
				<Form
					schema={schema}
					onSubmit={async (output) => {
						configMutation.reset();
						imagesMutation.reset();
						setImages(undefined);
						setFullImage(undefined);
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
						const result = await imagesMutation.mutateAsync({
							...config,
							model: output.model,
							sceneLimit: output.sceneCount,
						});
						setImages(result);
						editForm.setValue(
							"changes",
							result.map((image) => ({
								changeImage: false,
								text: `${image.speechBubble?.characterName}: ${image.speechBubble?.text}`,
							})),
						);
						const fullImage = await joinImagesFE(
							result.map((image) => image.image).filter(isTruthy),
						);
						if (fullImage) setFullImage(fullImage);
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
