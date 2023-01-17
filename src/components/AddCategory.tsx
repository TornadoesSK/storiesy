import { api } from "../utils/api";
import { Form } from "./form/Form";
import { useForm } from "./form/useForm";
import { z } from "zod";

const formSchema = z.object({
	name: z.string({ required_error: "Please enter a name." }),
});

export const AddCategory = () => {
	const addExample = api.categories.create.useMutation();
	const utils = api.useContext();
	const form = useForm({ schema: formSchema });

	return (
		<div className="m-4">
			<Form
				schema={formSchema}
				form={form}
				formProps={{
					className: "flex flex-col gap-2",
				}}
				onSubmit={(input) => {
					addExample.mutate(input, {
						onSuccess(data) {
							utils.categories.getAll.setData(undefined, (oldData) => [
								...(oldData ? oldData : []),
								data,
							]);
							form.reset();
						},
					});
				}}
			/>
			{addExample.isLoading && <p>Saving...</p>}
		</div>
	);
};
