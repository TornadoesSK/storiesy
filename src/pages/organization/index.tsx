import { z } from "zod";
import { Form, SelectStringSchema } from "../../components/form/Form";
import { api, type RouterOutputs } from "../../utils/api";

export default function Organization() {
	const organization = api.organization.get.useQuery();
	return (
		<>
			<ChangeOrganization />
			{organization.data ? (
				<OrganizationDetail organization={organization.data} />
			) : (
				<CreateOrganization />
			)}
		</>
	);
}

function OrganizationDetail({
	organization,
}: {
	organization: NonNullable<RouterOutputs["organization"]["get"]>;
}) {
	return (
		<div className="p-8 text-neutral">
			<h1 className="mb-4 text-4xl text-neutral">Organization detail</h1>
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

function ChangeOrganization() {
	const mutation = api.organization.change.useMutation();
	const organizationIds = api.organization.list.useQuery();
	return (
		<div>
			{organizationIds.isLoading && <p>Fetching organizations...</p>}
			{organizationIds.data && (
				<>
					<h1>Change organization</h1>
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
								options: ["None", ...organizationIds.data.map((org) => org.id)],
								labelMap: organizationIds.data.reduce(
									(acc, org) => ({ ...acc, [org.id]: org.name }),
									{},
								),
							},
						}}
						formProps={{
							hasSubmitButton: true,
						}}
					/>
				</>
			)}
			{mutation.isLoading && <p>Loading...</p>}
		</div>
	);
}

const createOrganizationSchema = z
	.object({
		name: z.string(),
		color: z.string(),
	})
	.refine(({ color }) => /^#[0-9A-F]{6}$/i.test(color), {
		message: "Color must be a valid hex color",
		path: ["color"],
	});

function CreateOrganization() {
	const mutation = api.organization.create.useMutation();
	return (
		<div>
			<h1>Create organization</h1>
			<Form
				schema={createOrganizationSchema}
				onSubmit={async (output) => {
					await mutation.mutateAsync(output);
					location.reload();
				}}
			/>
			{mutation.isLoading && <p>Loading...</p>}
		</div>
	);
}
