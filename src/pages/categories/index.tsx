import { AddCategory } from "../../components/AddCategory";
import { api } from "../../utils/api";

export default function Categories() {
	const categories = api.categories.getAll.useQuery();
	return (
		<>
			<div>
				{categories.data === undefined || categories.data.length === 0
					? "No categories"
					: categories.data.map((category) => (
							<div key={category.id} className="card flex-1 border bg-base-100 shadow-xl">
								{category.name}
							</div>
					  ))}
			</div>
			<AddCategory />
		</>
	);
}
