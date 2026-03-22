declare module 'diff' {
  export function structuredPatch(
    oldFileName: string,
    newFileName: string,
    oldStr: string,
    newStr: string,
    oldHeader?: string,
    newHeader?: string,
    options?: any
  ): any;

  export function createPatch(
    fileName: string,
    oldStr: string,
    newStr: string,
    oldHeader?: string,
    newHeader?: string,
    options?: any
  ): string;

  export function applyPatch(source: string, patch: string | any): string | false;
  export function parsePatch(patch: string): any[];
  export function diffLines(oldStr: string, newStr: string, options?: any): any[];
}
