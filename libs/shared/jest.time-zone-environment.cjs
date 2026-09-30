const { TestEnvironment } = require('jest-environment-jsdom');

/**
 * The jsdom environment, plus a `setTimeZone(timeZone)` global for specs whose subject depends on
 * the zone the code runs in.
 *
 * A spec cannot change the zone by itself: Jest hands it a copy of `process.env`, so assigning `TZ`
 * there never reaches V8, and the runner's own zone -- UTC on CI -- is the only one ever exercised.
 * This environment runs in the worker's real process, where the assignment does take effect, and
 * puts the zone back once the file is done, since the worker goes on to run other files.
 *
 * Opt in per file with a `@jest-environment <rootDir>/jest.time-zone-environment.cjs` docblock.
 */
module.exports = class TimeZoneEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();

    this.originalTimeZone = process.env.TZ;
    this.systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.global.setTimeZone = (timeZone) => {
      process.env.TZ = timeZone;
    };
  }

  async teardown() {
    // Deleting TZ does not tell V8 the zone changed, so the last one set would stay in force for
    // every file the worker runs next. Assigning the original zone back does, and only then is the
    // variable removed again when it was never set.
    process.env.TZ = this.originalTimeZone ?? this.systemTimeZone;
    if (this.originalTimeZone === undefined) {
      delete process.env.TZ;
    }

    await super.teardown();
  }
};
