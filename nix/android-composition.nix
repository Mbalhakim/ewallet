with (import <nixpkgs> {
  config.allowUnfree = true;
  config.android_sdk.accept_license = true;
});

androidenv.composeAndroidPackages {
  platformVersions = [ "34" "31" ];
  buildToolsVersions = [ "34.0.0" "33.0.1" ];
  ndkVersions = [ "25.1.8937393" ];
  cmakeVersions = [ "3.22.1" ];

  includeEmulator = true;
  includeSystemImages = true;
  includeNDK = true;
  systemImageTypes = [ "google_apis_playstore" ];
  abiVersions = [ "x86_64" ];
}

