import { api } from "../utils/api";
import { z, type output } from "zod";
import { Form, SelectStringSchema, useForm } from "./Form";

const formSchema = z.object({
	name: z.string({ required_error: "Please enter a name." }),
	amount: z.number({ required_error: "Please enter an amount." }),
	categoryId: SelectStringSchema,
	note: z.string().optional(),
});

function useAddExpense() {
	const categoriesQuery = api.categories.getAll.useQuery(undefined);
	const categoryIds = categoriesQuery.data?.map((category) => category.id) ?? [];
	const labelMap = categoriesQuery.data?.reduce(
		(acc, category) => ({ ...acc, [category.id]: category.name }),
		{},
	);
	const utils = api.useContext();
	const form = useForm({ schema: formSchema });
	const addExample = api.expenses.create.useMutation();
	return {
		selectProps: {
			options: categoryIds,
			labelMap,
		},
		onSubmit: async (output: output<typeof formSchema>) => {
			addExample.mutate(output, {
				onSuccess(data) {
					utils.expenses.getAll.setData(undefined, (oldData) => [
						...(oldData ? oldData : []),
						data,
					]);
				},
			});
			form.reset();
		},
		loading: addExample.isLoading,
		form,
	};
}

export const AddExpense = () => {
	const { selectProps, onSubmit, loading, form } = useAddExpense();
	return (
		<div className="m-4">
			<Form
				form={form}
				schema={formSchema}
				onSubmit={onSubmit}
				props={{ categoryId: selectProps }}
				formProps={{ loading }}
			/>
			{loading && <p>Saving...</p>}
		</div>
	);
};
