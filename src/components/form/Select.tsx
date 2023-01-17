import { useTsController } from "@ts-react/form";
import { type ReactNode } from "react";

type SelectProps = {
	options: string[];
	labelMap?: Record<string, ReactNode>;
};
export function Select({ options, labelMap }: SelectProps) {
	const { field, error } = useTsController<string>();

	return (
		<>
			<select
				value={field.value ? field.value : ""}
				onChange={(e) => field.onChange(e.target.value || undefined)}
				className="select-bordered select"
			>
				<option value="">Choose an option</option>
				{options.map((option) => (
					<option value={option} key={option}>
						{labelMap?.[option] ?? option}
					</option>
				))}
			</select>
			{error && <span>{error.errorMessage}</span>}
		</>
	);
}
