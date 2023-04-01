import { z } from "zod";
import { createTsForm, createUniqueFieldSchema } from "@ts-react/form";
import { type ReactNode } from "react";
import { Select } from "./Select";
import { Checkbox } from "./Checkbox";
import { NumberInput } from "./NumberInput";
import { TextInput } from "./TextInput";

export const SelectStringSchema = createUniqueFieldSchema(z.string(), "select");

const mapping = [
	[z.string(), TextInput],
	[z.number(), NumberInput],
	[z.boolean(), Checkbox],
	[SelectStringSchema, Select],
	[z.enum([""]), Select],
] as const;

type FormProps = {
	children: ReactNode,
	onSubmit: () => void,
	className?: string,
	loading?: boolean,
	hasSubmitButton?: boolean,
	submitText?: string
};
export const Form = createTsForm(mapping, {
	FormComponent: ({ children, onSubmit, className, loading, hasSubmitButton, submitText }: FormProps) => {
		return (
			<form onSubmit={onSubmit} className={className}>
				{children}
				{hasSubmitButton && (
					<button className={`btn text-white bg-primary border-0 ${loading ? "loading" : ""} disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-400 hover:bg-primary hover:text-white`} type="submit" disabled={loading}>
						{submitText || "Submit"}
					</button>
				)}
			</form>
		);
	},
});
