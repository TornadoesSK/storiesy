import { useTsController } from "@ts-react/form";

export const NumberInput = () => {
	const { field, error } = useTsController<number>();
	return (
		<>
			<input
				className="input-bordered input"
				type="number"
				placeholder={field.name}
				value={field.value ? field.value : ""}
				onChange={(e) => {
					const value = parseInt(e.target.value);
					if (isNaN(value)) field.onChange(undefined);
					else field.onChange(value);
				}}
			/>
			{error && <span>{error.errorMessage}</span>}
		</>
	);
};
