import * as React from "react";
import { useFormContext, useFormState } from "react-hook-form";

const FormFieldContext = React.createContext({});
const FormItemContext = React.createContext({});

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);

  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext?.name });
  const fieldState = getFieldState(fieldContext?.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField phải dùng trong <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-description`,
    formMessageId: `${id}-message`,
    ...fieldState,
  };
}

export { useFormField, FormFieldContext, FormItemContext };