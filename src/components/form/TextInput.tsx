import { useTsController } from "@ts-react/form";

type TextInputProps = {
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	labelText?: string;
	wrapperClassName?: string;
};

export const TextInput = ({
	placeholder,
	className,
	disabled,
	labelText,
	wrapperClassName,
}: TextInputProps) => {
	const { field, error } = useTsController<string>();
	return (
		<div className={wrapperClassName}>
			{labelText && <label className={`mb-2 inline-block text-neutral ${error ? "text-error" : ""}`}>{labelText}</label>}
			<input
				className={
					`input-bordered input bg-white text-neutral shadow-lg ${error ? "border-error" : ""} focus:border-primary focus:outline-0 disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-400 ` +
					className
				}
				placeholder={placeholder || field.name}
				value={field.value ? field.value : ""}
				onChange={(e) => {
					field.onChange(e.target.value || undefined);
				}}
				disabled={disabled}
			/>
		</div>
	);
};
