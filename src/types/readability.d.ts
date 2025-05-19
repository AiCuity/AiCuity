
declare module '@mozilla/readability' {
  export class Readability {
    constructor(document: Document, options?: any);
    parse(): {
      title: string;
      content: string;
      textContent: string;
      length: number;
      excerpt?: string;
      byline?: string;
      dir?: string;
      siteName?: string;
      lang?: string;
    } | null;
  }
}
