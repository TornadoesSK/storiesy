import { ExpensesList } from "../components/expenses/ExpensesList";
import { AddExpense } from "../components/expenses/AddExpense";

export default function Home() {
	return (
		<>
			<ExpensesList />
			<AddExpense />
		</>
	);
}
