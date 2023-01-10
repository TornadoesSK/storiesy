import { api } from "../utils/api";
import { Form, useForm } from "./Form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string({ required_error: "Please enter a name." }),
  amount: z.number({ required_error: "Please enter an amount." }),
  note: z.string().optional(),
});

export const AddExpense = () => {
  const addExample = api.expenses.create.useMutation();
  const utils = api.useContext();
  const form = useForm({ schema: formSchema });

  return (
    <div className="m-4">
      <Form
        schema={formSchema}
        form={form}
        formProps={{
          className: "flex flex-col gap-2",
        }}
        onSubmit={(input) => {
          addExample.mutate(input, {
            onSuccess: (data) => {
              utils.expenses.getAll.setData(undefined, (oldData) => [
                ...(oldData ? oldData : []),
                data,
              ]);
              form.reset();
            },
          });
        }}
      />
      {addExample.isLoading && <p>Saving...</p>}
    </div>
  );
};
