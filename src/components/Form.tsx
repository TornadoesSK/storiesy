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

function Select({ options }: { options: string[] }) {
	const { field, error } = useTsController<string>();

	return (
		<>
			<select value={field.value ? field.value : ""} name={field.name}>
				{options.map((option) => (
					<option value={option} key={option}>
						{option}
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
	[SelectStringSchema, Select] as const,
] as const;

export const Form = createTsForm(mapping, {
	FormComponent: ({
		children,
		onSubmit,
		className,
	}: {
		children: ReactNode;
		onSubmit: () => void;
		className?: string;
	}) => {
		return (
			<form onSubmit={onSubmit} className={className}>
				{children}
				<button className="btn" type="submit">
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
