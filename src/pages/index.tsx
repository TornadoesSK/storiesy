import { ExpensesList } from "../components/expenses/ExpensesList";
import { AddExpense } from "../components/expenses/AddExpense";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useAppState } from "../components/useAppState";

export default function Home() {
	const { supabaseClient } = useAppState();
	const router = useRouter();
	const handleSignOutClick = useCallback(async () => {
		await supabaseClient.auth.signOut();
		router.reload();
	}, [router, supabaseClient.auth]);
	return (
		<>
			<button onClick={handleSignOutClick} className="btn">
				Sign out
			</button>
			<ExpensesList />
			<AddExpense />
		</>
	);
}
