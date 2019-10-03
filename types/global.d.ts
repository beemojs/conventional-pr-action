declare module 'conventional-changelog-preset-loader' {
  interface Result {
    type: string;
  }

  export default function load(name: string): {
    checkCommitFormat?: (commit: string) => Result | null | undefined;
    conventionalChangelog?: object;
    parserOpts?: object;
    recommendedBumpOpts?: object;
    writerOpts?: object;
  };
}

declare module 'conventional-commits-parser' {
  interface Result {
    body: string | null;
    type: string;
  }

  interface Parser {
    (options?: object): Promise<Result | null | undefined>;
    sync(commit: string, options?: object): Result | null | undefined;
  }

  const parser: Parser;

  export default parser;
}
