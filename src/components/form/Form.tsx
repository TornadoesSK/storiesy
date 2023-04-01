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