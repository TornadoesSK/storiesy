import { z, type ZodTypeAny } from "zod";
import { createTsForm, createUniqueFieldSchema, useTsController } from "@ts-react/form";
import { type ReactNode } from "react";
import { useForm as useReactHookForm, type UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const TextInput = () => {
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

const NumberInput = () => {
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

function Checkbox() {
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

type SelectProps = {
	options: string[];
	labelMap?: Record<string, ReactNode>;
};
function Select({ options, labelMap }: SelectProps) {
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

export const SelectStringSchema = createUniqueFieldSchema(z.string(), "select");

const mapping = [
	[z.string(), TextInput],
	[z.number(), NumberInput],
	[z.boolean(), Checkbox],
	[SelectStringSchema, Select],
] as const;

type FormProps = {
	children: ReactNode;
	onSubmit: () => void;
	className?: string;
	loading?: boolean;
};
export const Form = createTsForm(mapping, {
	FormComponent: ({ children, onSubmit, className, loading }: FormProps) => {
		return (
			<form onSubmit={onSubmit} className={className}>
				{children}
				<button className={`btn ${loading ? "loading" : ""}`} type="submit">
					submit
				</button>
			</form>
		);
	},
});

export const useForm = <T extends ZodTypeAny>({
	schema,
	...props
}: {
	schema: T;
} & UseFormProps<z.input<T>>) => {
	return useReactHookForm<z.infer<T>>({
		resolver: zodResolver(schema),
		...props,
	});
};
