with (import <nixpkgs> { });
let
  jdk = jdk17;
  android-composition = import ./nix/android-composition.nix;
in
mkShell rec {
  name = "android-shell";

  buildInputs = [
    jdk
    gradle
    android-composition.androidsdk
  ];
  ANDROID_SDK_ROOT = "${android-composition.androidsdk}/libexec/android-sdk";
}
