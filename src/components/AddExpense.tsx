import { api } from "../utils/api";
import { z } from "zod";

const formSchema = z
	.object({
		name: z.string({ required_error: "Please enter a name." }),
		amount: z.number({ required_error: "Please enter an amount." }),
		category: z.string(),
		note: z.string().optional(),
		_validation: z.object({
			categories: z.string().array(),
		}),
	})
	.refine(
		({ category, _validation: { categories } }) => categories.includes(category),
		"Invalid category",
	)
	.transform(({ _validation, ...output }) => output);

export const AddExpense = () => {
	const categoriesQuery = api.categories.getAll.useQuery(undefined);
	const categories = categoriesQuery.data?.map((category) => category.name);
	const addExample = api.expenses.create.useMutation();

	return <div className="m-4">{addExample.isLoading && <p>Saving...</p>}</div>;
};
