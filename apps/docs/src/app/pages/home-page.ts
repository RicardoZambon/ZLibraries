import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MANIFEST, REPO_URL, STORYBOOK_URL } from '../content/manifest';
import { ExampleIsland } from '../example/example-island';

/** The landing page. */
@Component({
  selector: 'docs-home-page',
  imports: [RouterLink, ExampleIsland],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly repoUrl = REPO_URL;
  protected readonly storybookUrl = STORYBOOK_URL;
  /** A live example for the hero, when the examples library has one. */
  protected readonly heroExample = ['button-intents', ...MANIFEST.examples].find((id) =>
    MANIFEST.examples.includes(id),
  );
  protected readonly install = 'npm i @zambon-dev/ui';
}
