import { z } from "zod";
import { Form } from "../../components/form/Form";
import { api, type RouterOutputs } from "../../utils/api";

export default function Organization() {
	const organization = api.organization.get.useQuery();
	return (
		<>
			{organization.data ? (
				<OrganizationDetail organization={organization.data} />
			) : (
				<CreateOrganization />
			)}
		</>
	);
}

const addOrganizationMemberSchema = z.object({
	email: z.string().email(),
});

function OrganizationDetail({
	organization,
}: {
	organization: NonNullable<RouterOutputs["organization"]["get"]>;
}) {
	const addMemberMutation = api.organization.addMember.useMutation();

	return (
		<div className="p-4">
			<h1>Organization detail</h1>
			<div>
				<span className="font-medium">Name:</span> {organization.name}
			</div>
			<div>
				<span className="font-medium">Color:</span> {organization.color}
			</div>
			<div>
				<span className="font-medium">Members:</span>
				<ul>
					{organization.account.map((member, idx) => (
						<li key={`${member}${idx}`}>{member.email}</li>
					))}
				</ul>
			</div>
			<div>
				Add members
				<Form
					schema={addOrganizationMemberSchema}
					onSubmit={async (output) => {
						const result = await addMemberMutation.mutateAsync({ email: output.email });
						if (result) {
							location.reload();
						}
					}}
				/>
				{addMemberMutation.isLoading && <p>Loading...</p>}
			</div>
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
