import { ExpensesList } from "../../components/expenses/ExpensesList";
import { AddExpense } from "../../components/expenses/AddExpense";

export default function Expenses() {
	return (
		<>
			<ExpensesList />
			<AddExpense />
		</>
	);
}
