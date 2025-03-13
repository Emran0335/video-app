import React, { ForwardedRef, useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  type?: string;
  className?: string;
  className2?: string;
}
const Input = React.forwardRef(function Input(
  {
    label,
    type = "text",
    className = "",
    className2 = "",
    ...props
  }: InputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const id = useId();
  return (
    <div className={`w-full ${className2}`}>
      {label && (
        <label className="inline-block mb-1 pl-1" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        type={type}
        className={`${className} w-full bg-zinc-800 px-4 py-1 text-white border border-gray-200 outline-none hover:bg-zinc-500 hover:placeholder:text-gray-200 focus:bg-blue-800`}
        ref={ref}
        {...props}
        id={id}
      />
    </div>
  );
});

export default Input;

/*
className={`px-8 py-1 bg-zinc-800 text-white outline-none duration-200 border focus:bg-blue-800 border-gray-200 w-full ${className}`}
*/
