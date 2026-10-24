/**
 * An entry for the `assets` array of an Angular application's build target.
 *
 * Both i18n helpers publish one so a consumer can spread it into its own build
 * configuration instead of hand-writing the path into this package.
 */
export interface AngularAssetPattern {
  glob: string;
  input: string;
  output: string;
}
