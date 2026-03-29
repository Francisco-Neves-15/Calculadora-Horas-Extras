"use client"

export interface ViewProps {
  children: React.ReactNode;
}

const View = ({ 
  children 
}: ViewProps) => {
  return (
    <div className="flex flex-col justify-start justify-items-start items-start content-start">
      {children}
    </div>
  );
}

export default View;
