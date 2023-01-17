import { useTsController } from "@ts-react/form";

export const TextInput = () => {
	const { field, error } = useTsController<string>();
	return (
		<>
			<input
				className="input-bordered input"
				placeholder={field.name}
				value={field.value ? field.value : ""}
				onChange={(e) => {
					field.onChange(e.target.value || undefined);
				}}
			/>
			{error && <span>{error.errorMessage}</span>}
		</>
	);
};
