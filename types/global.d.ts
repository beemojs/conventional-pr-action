declare module 'conventional-changelog-preset-loader' {
  interface Result {
    type: string;
  }

  type Load = (name: string) => {
    checkCommitFormat?: (commit: string) => Result | null | undefined;
    conventionalChangelog?: object;
    parserOpts?: object;
    recommendedBumpOpts?: object;
    writerOpts?: object;
  };

  interface Loader {
    presetLoader: (requireMethod: NodeRequireFunction) => Load;
    (name: string): ReturnType<Load>;
  }

  const loader: Loader;

  export default loader;
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

declare module '@octokit/graphql' {
  export type Variables = {};
  export type GraphQlQueryResponse = {};
}
