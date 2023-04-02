import { z } from "zod";
import { createTsForm, createUniqueFieldSchema } from "@ts-react/form";
import { type ReactNode } from "react";
import { Select } from "./Select";
import { Checkbox } from "./Checkbox";
import { NumberInput } from "./NumberInput";
import { TextInput } from "./TextInput";
import { ChangesInput } from "./ChangesInput";

export const SelectStringSchema = createUniqueFieldSchema(z.string(), "select");

const mapping = [
	[z.string(), TextInput],
	[z.number(), NumberInput],
	[z.boolean(), Checkbox],
	[SelectStringSchema, Select],
	[z.enum([""]), Select],
	[
		z.array(
			z.object({
				changeImage: z.boolean(),
				text: z.string(),
			}),
		),
		ChangesInput,
	],
] as const;

type FormProps = {
	children: ReactNode;
	onSubmit: () => void;
	className?: string;
	loading?: boolean;
	showSubmitButton?: boolean;
	submitText?: string;
};
export const Form = createTsForm(mapping, {
	FormComponent: ({
		children,
		onSubmit,
		className,
		loading,
		showSubmitButton,
		submitText,
	}: FormProps) => {
		return (
			<form onSubmit={onSubmit} className={className}>
				{children}
				{showSubmitButton && (
					<button
						className={`btn border-0 bg-primary text-white ${
							loading ? "loading" : ""
						} hover:bg-primary hover:text-white disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-400`}
						type="submit"
						disabled={loading}
					>
						{submitText || "Submit"}
					</button>
				)}
			</form>
		);
	},
});
