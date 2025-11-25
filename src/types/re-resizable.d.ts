declare module 're-resizable' {
  import * as React from 'react';

  export interface ResizableSize {
    width?: number | string;
    height?: number | string;
  }

  export interface ResizableProps extends React.HTMLAttributes<HTMLElement> {
    size?: ResizableSize;
    defaultSize?: ResizableSize;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    enable?: { [key: string]: boolean };
    lockAspectRatio?: boolean;
    onResizeStop?: (e: Event | undefined, direction: any, ref: HTMLElement, delta: { width: number; height: number }) => void;
    className?: string;
    style?: React.CSSProperties;
  }

  const Resizable: React.ComponentType<ResizableProps>;
  export default Resizable;
}
