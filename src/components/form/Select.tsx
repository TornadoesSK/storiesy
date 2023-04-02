import { useTsController } from "@ts-react/form";
import { type ReactNode } from "react";

type SelectProps = {
	options: string[],
	labelMap?: Record<string, ReactNode>,
	className?: string,
	disabled?: boolean,
	labelText?: string,
	placeholder?: string | boolean,
	wrapperClassName?: string,
};
export function Select({
	options,
	labelMap,
	className,
	disabled,
	labelText,
	placeholder,
	wrapperClassName,
}: SelectProps) {
	const { field, error } = useTsController<string>();

	return (
		<div className={wrapperClassName}>
			{labelText && <label className={`mb-2 inline-block text-neutral ${error && "text-error"}`}>{labelText}</label>}
			<select
				value={field.value ? field.value : ""}
				onChange={(e) => field.onChange(e.target.value || undefined)}
				className={
					`select-bordered select w-full bg-white text-neutral font-normal text-base shadow-lg shadow-lg ${error && "border-error"} focus:border-primary focus:outline-0 disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-400 ` +
					className
				}
				disabled={disabled}
			>
				<option value="">{placeholder || "Choose an option"}</option>
				{options.map((option) => (
					<option value={option} key={option}>
						{labelMap?.[option] ?? option}
					</option>
				))}
			</select>
		</div>
	);
}
