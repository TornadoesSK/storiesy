import { z, type ZodTypeAny } from "zod";
import { useForm as useReactHookForm, type UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
