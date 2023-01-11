import { ExpensesList } from "../components/ExpensesList";
import { AddExpense } from "../components/AddExpense";

export default function Home() {
	return (
		<>
			<ExpensesList />
			<AddExpense />
		</>
	);
}
