import { api } from "../../utils/api";
import { Expense } from "./Expense";

export const ExpensesList = () => {
	const expenses = api.expenses.getAll.useQuery();

	if (expenses.isFetching) return <>Loading...</>;

	return (
		<div className="m-4 flex flex-col gap-4">
			{expenses.data === undefined || expenses.data.length === 0
				? "No expenses"
				: expenses.data.map((expense) => <Expense key={expense.id} expense={expense} />)}
		</div>
	);
};
