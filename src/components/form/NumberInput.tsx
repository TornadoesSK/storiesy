import { useTsController } from "@ts-react/form";

type NumberInputProps = {
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	labelText?: string;
	wrapperClassName?: string;
};

export const NumberInput = ({
	placeholder,
	className,
	disabled,
	labelText,
	wrapperClassName,
}: NumberInputProps) => {
	const { field, error } = useTsController<number>();
	return (
		<div className={wrapperClassName}>
			{labelText && <label className={`mb-2 inline-block text-neutral ${error ? "text-error" : ""}`}>{labelText}</label>}
			<input
				className={
					`input-bordered input bg-white text-neutral shadow-lg ${error ? "border-error" : ""} focus:border-primary focus:outline-0 disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-400 ` +
					className
				}
				type="number"
				placeholder={placeholder || field.name}
				value={field.value ? field.value : ""}
				onChange={(e) => {
					const value = parseInt(e.target.value);
					if (isNaN(value)) field.onChange(undefined);
					else field.onChange(value);
				}}
				disabled={disabled}
			/>
		</div>
	);
};
