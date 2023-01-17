import { useTsController } from "@ts-react/form";

export function Checkbox() {
	const { field, error } = useTsController<boolean>();

	return (
		<>
			<input
				type="checkbox"
				checked={field.value ? field.value : false}
				onChange={(e) => field.onChange(e.target.checked)}
			/>
			{error && <span>{error.errorMessage}</span>}
		</>
	);
}
