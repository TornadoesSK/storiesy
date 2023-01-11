import { api } from "../utils/api";

export const ExpensesList = () => {
	const expenses = api.expenses.getAll.useQuery();

	if (expenses.isFetching) return <>Loading...</>;

	return (
		<div className="m-4 flex flex-col gap-4">
			{expenses.data === undefined || expenses.data.length === 0
				? "No expenses"
				: expenses.data.map((expense) => (
						<div key={expense.id} className="card flex-1 border bg-base-100 shadow-xl">
							<div className="card-body">
								<h2 className="card-title flex justify-between">
									<span>{expense.name}</span>
									<span className={`${expense.amount > 0 ? "text-green-500" : "text-red-500"}`}>
										{expense.amount}
									</span>
								</h2>
								{expense.note && <>Note: {expense.note}</>}
							</div>
						</div>
				  ))}
		</div>
	);
};
