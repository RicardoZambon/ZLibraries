const nxPreset = require('@nx/jest/preset').default;

// `transform` is dropped deliberately. @nx/jest's preset registers ts-jest under its own
// regex key, and Jest MERGES transform maps instead of replacing them -- so a project that
// declares its own jest-preset-angular transform still ends up with the preset's ts-jest
// entry beside it. Jest resolves every entry up front, so the workspace had to keep ts-jest
// installed purely to satisfy a transform nothing ever used; dropping it with the Jest 30
// upgrade is what broke CI. Every project here brings its own transform, and the root config
// only aggregates them, so there is nothing left for the preset's to do.
const { transform, ...preset } = nxPreset;

module.exports = preset;
