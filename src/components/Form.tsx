import { z } from "zod";
import { createTsForm, useTsController } from "@ts-react/form";
import { ReactNode } from "react";

const TextField = () => {
  const { field, error } = useTsController<string>();
  return (
    <>
      <input
        className="input-bordered input"
        placeholder={field.name}
        value={field.value ? field.value : ""}
        onChange={(e) => {
          field.onChange(e.target.value);
        }}
      />
      {error?.errorMessage && <span>{error?.errorMessage}</span>}
    </>
  );
};

const NumberField = () => {
  const { field, error } = useTsController<number>();
  return (
    <>
      <input
        className="input-bordered input"
        type="number"
        placeholder={field.name}
        value={field.value ? field.value : ""}
        onChange={(e) => {
          field.onChange(Number(e.target.value));
        }}
      />
      {error?.errorMessage && <span>{error?.errorMessage}</span>}
    </>
  );
};

function CheckBoxField() {
  const { field, error } = useTsController<boolean>();

  return (
    <>
      <input
        type="checkbox"
        checked={field.value || false}
        onChange={(e) => field.onChange(e.target.checked)}
      />
      {error?.errorMessage && <span>{error?.errorMessage}</span>}
    </>
  );
}

const mapping = [
  [z.string(), TextField],
  [z.number(), NumberField],
  [z.boolean(), CheckBoxField],
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
