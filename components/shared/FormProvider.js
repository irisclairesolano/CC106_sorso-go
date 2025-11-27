'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { cloneElement, createContext, isValidElement, useContext, useRef } from 'react';
import { FormProvider as HookFormProvider, useController, useForm } from 'react-hook-form';

export const FormContext = createContext({});

export function useFormContext() {
  return useContext(FormContext);
}

export function FormProvider({ 
  children, 
  schema, 
  defaultValues = {}, 
  onSubmit, 
  mode = 'onBlur',
  methods: externalMethods,
  ...props 
}) {
  const formRef = useRef();
  
  const createdMethods = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues,
    mode,
  });

  const methods = externalMethods ?? createdMethods;

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      if (onSubmit) {
        return await onSubmit(data);
      }
      return data;
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle API errors here if needed
      throw error;
    }
  });

  return (
    <FormContext.Provider value={{ ...methods, formRef }}>
      <HookFormProvider {...methods}>
        <form 
          ref={formRef} 
          onSubmit={handleSubmit} 
          className="space-y-6"
          {...props}
        >
          {children}
        </form>
      </HookFormProvider>
    </FormContext.Provider>
  );
}

export function FormField({ 
  name, 
  label, 
  hint, 
  children, 
  className = '',
  labelClass = '',
  errorClass = 'mt-1 text-sm text-red-600',
  hintClass = 'mt-1 text-sm text-gray-500',
  required = false,
  render,
  inputClassName = '',
  ...rest 
}) {
  const methods = useFormContext();
  const { control, formState } = methods;
  const { field, fieldState } = useController({ name, control });
  const error = fieldState.error;

  const { onChange: customOnChange, onBlur: customOnBlur, ...inputProps } = rest;

  const handleChange = (value) => {
    field.onChange(value);
    if (typeof customOnChange === 'function') {
      customOnChange(value);
    }
  };

  const handleBlur = (event) => {
    field.onBlur(event);
    if (typeof customOnBlur === 'function') {
      customOnBlur(event);
    }
  };

  const renderControl = () => {
    const augmentedField = {
      ...field,
      onChange: handleChange,
      onBlur: handleBlur,
    };

    if (typeof render === 'function') {
      return render({
        field: augmentedField,
        fieldState,
        formState,
      });
    }

    if (isValidElement(children)) {
      const childOnChange = children.props.onChange;
      const childOnBlur = children.props.onBlur;

      return cloneElement(children, {
        id: children.props.id ?? name,
        ...inputProps,
        ...augmentedField,
        onChange: (value) => {
          augmentedField.onChange(value);
          if (typeof childOnChange === 'function') {
            childOnChange(value);
          }
        },
        onBlur: (event) => {
          augmentedField.onBlur(event);
          if (typeof childOnBlur === 'function') {
            childOnBlur(event);
          }
        },
        ref: augmentedField.ref,
      });
    }

    if (typeof children === 'function') {
      return children({
        field: augmentedField,
        fieldState,
        formState,
      });
    }

    const value = typeof augmentedField.value === 'undefined' ? '' : augmentedField.value;

    return (
      <input
        id={name}
        {...inputProps}
        name={name}
        value={value}
        onChange={augmentedField.onChange}
        onBlur={augmentedField.onBlur}
        ref={augmentedField.ref}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
        } ${inputClassName}`.trim()}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className={`block text-sm font-medium text-gray-700 ${labelClass}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderControl()}
      
      {hint && !error && <p className={hintClass}>{hint}</p>}
      {error && <p id={`${name}-error`} className={errorClass}>{error.message}</p>}
    </div>
  );
}

export function FormActions({ children, className = 'flex justify-end space-x-3' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function SubmitButton({ 
  children = 'Save', 
  isSubmitting, 
  className = '',
  ...props 
}) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${className}`}
      {...props}
    >
      {isSubmitting ? 'Saving...' : children}
    </button>
  );
}

export function CancelButton({ 
  children = 'Cancel', 
  onClick, 
  className = '',
  ...props 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
