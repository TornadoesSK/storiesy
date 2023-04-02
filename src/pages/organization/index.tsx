import { z } from "zod";
import { Form, SelectStringSchema } from "../../components/form/Form";
import { api, type RouterOutputs } from "../../utils/api";

export default function Organization() {
	const organization = api.organization.get.useQuery();
	return (
		<div className="flex h-full flex-col justify-between p-8 text-neutral">
			{organization.data ? (
				<OrganizationDetail organization={organization.data} />
			) : (
				<CreateOrganization />
			)}
			<ChangeOrganization />
		</div>
	);
}

function OrganizationDetail({
	organization,
}: {
	organization: NonNullable<RouterOutputs["organization"]["get"]>;
}) {
	return (
		<div>
			<div className="flex w-full items-center justify-between">
				<h1 className="mb-4 text-4xl text-neutral">Organization detail</h1>
				{organization?.logo && (
					// eslint-disable-next-line @next/next/no-img-element
					<img className="max-w-[150px]" src={organization.logo} alt="company logo" />
				)}
			</div>
			<div className="py-2">
				<span className="font-semibold">Organization name:</span> {organization.name}
			</div>
			<div className="py-2">
				<span className="font-semibold">Organization primary color:</span>{" "}
				<span className="bg-primary p-1 text-white">{organization.color}</span>
			</div>
			<div className="py-2">
				<span className="font-semibold">Members:</span>
				<ul>
					{organization.account.map((member, idx) => (
						<li key={`${member}${idx}`}>{member.email}</li>
					))}
				</ul>
			</div>
		</div>
	);
}

const changeOrganizationSchema = z.object({
	organizationId: SelectStringSchema,
});

function orgSelectPlaceholder(orgLoading: boolean, mutLoading: boolean) {
	if (orgLoading) {
		return "Fetching organizations..."
	}
	else if (mutLoading) {
		return "Loading..."
	}
	return false;
}

function ChangeOrganization() {
	const mutation = api.organization.change.useMutation();
	const organizationIds = api.organization.list.useQuery();
	return (
		<div>
			<>
				<h1 className="mb-2 text-xl">Change organization</h1>
				<Form
					schema={changeOrganizationSchema}
					onSubmit={async (output) => {
						await mutation.mutateAsync({
							organizationId: output.organizationId === "None" ? null : output.organizationId,
						});
						location.reload();
					}}
					props={{
						organizationId: {
							options: organizationIds.data
								? ["None", ...organizationIds.data.map((org) => org.id)]
								: ["None"],
							labelMap: organizationIds?.data?.reduce(
								(acc, org) => ({ ...acc, [org.id]: org.name }),
								{},
							),
							disabled: organizationIds.isLoading || mutation.isLoading,
							placeholder: orgSelectPlaceholder(organizationIds.isLoading, mutation.isLoading),
						},
					}}
					formProps={{
						showSubmitButton: true,
						submitText: "Change",
						className: "w-full flex items-end gap-2",
					}}
				/>
			</>
		</div>
	);
}

const createOrganizationSchema = z
	.object({
		name: z.string(),
		color: z.string(),
		logo: z.string(),
	})
	.refine(({ color }) => /^#[0-9A-F]{6}$/i.test(color), {
		message: "Color must be a valid hex color",
		path: ["color"],
	});

function CreateOrganization() {
	const mutation = api.organization.create.useMutation();
	return (
		<div>
			<h1 className="mb-6 text-4xl">Create organization</h1>
			<Form
				schema={createOrganizationSchema}
				onSubmit={async (output) => {
					await mutation.mutateAsync(output);
					location.reload();
				}}
				props={{
					name: {
						labelText: "Organization name",
						placeholder: " ",
						wrapperClassName: "flex flex-col items-start mb-6",
					},
					color: {
						labelText: "Organization main color",
						placeholder: "#000000",
						wrapperClassName: "flex flex-col items-start mb-6",
					},
					logo: {
						labelText: "Organization logo url",
						placeholder: " ",
						wrapperClassName: "flex flex-col items-start mb-6",
					}
				}}
				formProps={{
					showSubmitButton: true,
					loading: mutation.isLoading
				}}
			/>
		</div>
	);
}
