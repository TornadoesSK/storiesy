import { type expense } from "@prisma/client";
import { api } from "../../utils/api";

export function Expense({ expense }: { expense: expense }) {
	const utils = api.useContext();
	const deleteMutation = api.expenses.delete.useMutation({
		onMutate(deletedId) {
			utils.expenses.getAll.setData(undefined, (data) =>
				data?.filter(({ id }) => id !== deletedId),
			);
		},
	});
	return (
		<div className="card flex-1 border bg-base-100 shadow-xl">
			<div className="card-body">
				<h2 className="card-title flex justify-between">
					<span>{expense.name}</span>
					<div>
						<button onClick={() => deleteMutation.mutate(expense.id)} className="btn mr-4">
							Delete
						</button>
						<span className={`${expense.amount > 0 ? "text-green-500" : "text-red-500"}`}>
							{expense.amount}
						</span>
					</div>
				</h2>
				{expense.note && <>Note: {expense.note}</>}
			</div>
		</div>
	);
}
