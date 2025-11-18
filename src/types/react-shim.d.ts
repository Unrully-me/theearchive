// Minimal React type shims for environments without @types/react installed.
// These definitions let TypeScript accept basic React patterns in a pinch.

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  export type ChangeEvent<T = any> = any;
  export type MouseEvent = any;
  export type SyntheticEvent = any;
  export type FC<P = any> = any;
  export type ReactNode = any;
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  export const useMemo: any;
  export const useCallback: any;
}
