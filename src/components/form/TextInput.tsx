import { useTsController } from "@ts-react/form";

type TextInputProps = {
	placeholder: string,
	className?: string,
	labelText?: string
}

export const TextInput = ({placeholder, className, labelText}: TextInputProps) => {
	const { field, error } = useTsController<string>();
	return (
		<>
			{labelText && <label className="text-neutral mb-2 inline-block">{labelText}</label>}
			<input
				className={"input-bordered input " + className}
				placeholder={placeholder}
				value={field.value ? field.value : ""}
				onChange={(e) => {
					field.onChange(e.target.value || undefined);
				}}
			/>
			{error && <span>{error.errorMessage}</span>}
		</>
	);
};
