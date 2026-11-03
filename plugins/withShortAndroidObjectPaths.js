const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withShortAndroidObjectPaths(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('withShortAndroidObjectPaths requires a Groovy app/build.gradle');
    }

    const marker = '// Shorten CMake object paths for Windows Ninja builds.';
    if (!config.modResults.contents.includes(marker)) {
      // CMake hashes source directories when the full object path exceeds this limit.
      config.modResults.contents += `
${marker}
android {
    defaultConfig {
        externalNativeBuild {
            cmake {
                arguments "-DCMAKE_OBJECT_PATH_MAX=240"
            }
        }
    }
}
`;
    }
    return config;
  });
};
