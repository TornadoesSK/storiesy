import { useTsController } from "@ts-react/form";

type TextInputProps = {
	placeholder?: string,
	className?: string,
	disabled?: boolean,
	labelText?: string,
}

export const TextInput = ({placeholder, className, disabled, labelText}: TextInputProps) => {
	const { field, error } = useTsController<string>();
	return (
		<>
			{labelText && <label className="text-neutral mb-2 inline-block">{labelText}</label>}
			<input
				className={"input-bordered input " + className}
				placeholder={placeholder || field.name}
				value={field.value ? field.value : ""}
				onChange={(e) => {
					field.onChange(e.target.value || undefined);
				}}
				disabled={disabled}
			/>
			{error && <span>{error.errorMessage}</span>}
		</>
	);
};
