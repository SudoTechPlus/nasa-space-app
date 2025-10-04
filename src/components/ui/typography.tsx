import React, { ReactNode, HTMLAttributes } from "react";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export function H1({ children, className = "", ...props }: TypographyProps) {
  return (
    <h1
      className={`scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className = "", ...props }: TypographyProps) {
  return (
    <h2
      className={`scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className = "", ...props }: TypographyProps) {
  return (
    <h3
      className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({ children, className = "", ...props }: TypographyProps) {
  return (
    <h4
      className={`scroll-m-20 text-xl font-semibold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h4>
  );
}

export function Paragraph({ children, className = "", ...props }: TypographyProps) {
  return (
    <p className={`leading-7 [&:not(:first-child)]:mt-6 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function Blockquote({ children, className = "", ...props }: TypographyProps) {
  return (
    <blockquote className={`mt-6 border-l-2 pl-6 italic ${className}`} {...props}>
      {children}
    </blockquote>
  );
}

interface TableProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
export function Table({ children, className = "", ...props }: TableProps) {
  return (
    <div className={`my-6 w-full overflow-y-auto ${className}`} {...props}>
      <table className="w-full">{children}</table>
    </div>
  );
}

export function TableRow({ children, className = "", ...props }: TypographyProps) {
  return <tr className={`even:bg-muted m-0 border-t p-0 ${className}`} {...props}>{children}</tr>;
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  align?: "left" | "center" | "right";
}
export function TableCell({ children, align = "left", className = "", ...props }: TableCellProps) {
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  return <td className={`border px-4 py-2 ${alignClass} ${className}`} {...props}>{children}</td>;
}

export function List({ children, className = "", ...props }: TypographyProps) {
  return <ul className={`my-6 ml-6 list-disc [&>li]:mt-2 ${className}`} {...props}>{children}</ul>;
}

export function InlineCode({ children, className = "", ...props }: TypographyProps) {
  return (
    <code
      className={`bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold ${className}`}
      {...props}
    >
      {children}
    </code>
  );
}

export function Lead({ children, className = "", ...props }: TypographyProps) {
  return <p className={`text-muted-foreground text-xl ${className}`} {...props}>{children}</p>;
}

export function LargeText({ children, className = "", ...props }: TypographyProps) {
  return <div className={`text-lg font-semibold ${className}`} {...props}>{children}</div>;
}

export function SmallText({ children, className = "", ...props }: TypographyProps) {
  return <small className={`text-sm leading-none font-medium ${className}`} {...props}>{children}</small>;
}

export function MutedText({ children, className = "", ...props }: TypographyProps) {
  return <p className={`text-muted-foreground text-sm ${className}`} {...props}>{children}</p>;
}
