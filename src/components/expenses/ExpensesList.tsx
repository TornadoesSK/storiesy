import { api } from "../../utils/api";
import { Loading } from "../Loading";
import { Expense } from "./Expense";

export const ExpensesList = () => {
	const expenses = api.expenses.getAll.useQuery();

	return (
		<div className="relative m-4 flex flex-col gap-4">
			{expenses.isFetching && <Loading />}
			{expenses.error && <pre>ERROR: {JSON.stringify(expenses.error.message, null, 2)}</pre>}
			{expenses.data === undefined || expenses.data.length === 0
				? "No expenses"
				: expenses.data.map((expense) => <Expense key={expense.id} expense={expense} />)}
		</div>
	);
};
