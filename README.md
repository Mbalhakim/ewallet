# Installation

First, follow the installation steps described for Android Studio and React Native.

> For testing purposes, these instructions were followed on an Ubuntu laptop. The log has been provided [here](./Ubuntu-log.md).

Ensure that you have the following installed:

- **Android Studio** (including SDK and AVD Manager)
- **Node.js**
- **Java**
- **Gradle 8.7**
- **Kotlin 1.9**

If the emulator doesn’t start directly after building the app with `npx react-native start` and selecting Android, try the following:

1. Create a new Android Studio project.
2. Ensure you have at least API version **35** installed.
3. Make sure your `ANDROID_HOME` path is set correctly on Linux machines:
   ```bash
   export ANDROID_HOME=/home/your-username/Android/Sdk
   export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH
   ```

If the steps below do not work, try running:

```bash
npx react-native start
```

and reload from the selection menu.

---

## Troubleshooting

### Facebook Flipper Issues

If you face any problems with **Facebook Flipper**, make sure to **remove `^`** from the `package.json` on **lines 33, 29, and 46**. Additionally, add the following dependency:

```json
"react-native-worklets-core": "^1.5.0"
```

### Reanimated Babel Plugin Error

If you encounter the following error:

```
[Reanimated] Babel plugin exception: Error: Cannot find module '@babel/plugin-transform-template-literals'
```

Try the following steps:

1. Delete `package-lock.json` and `node_modules`.
2. Rerun the `npm install` command.

---

# Nix Config

If you're using Nix, simply use the dev shell with:

```bash
nix-shell shell.nix
```

---

## Gradle & Kotlin Versions

Ensure that you are using **Gradle 8.7** and **Kotlin 1.9**.

### Working Gradle settings for Mac (March 16, 2023):

#### Gradle 8.6

```
Build time:   2024-02-02 16:47:16 UTC
Revision:     d55c486870a0dc6f6278f53d21381396d0741c6e

Kotlin:       1.9.20
Groovy:       3.0.17
Ant:          Apache Ant(TM) version 1.10.13 compiled on January 4 2023
JVM:          17.0.5 (Oracle Corporation 17.0.5+9-LTS-191)
OS:           Windows 11 10.0 amd64
```

---

## Recommended Next Steps

Make sure you have installed native code dependencies by following [this guide](https://reactnative.dev/docs/environment-setup#installing-dependencies).

### Running the Project on Your Device

1. Open the project folder in **Visual Studio Code**.
2. Run:

   ```bash
   npm install
   ```

3. For iOS (only on MacOS):

   - Run `npx pod-install`.
   - Then, run `npx react-native run-ios` or follow the [iOS setup guide](https://reactnative.dev/docs/running-on-device#running-your-app-on-ios-devices).

4. For Android:
   - Use the Android Virtual Device in [Android Studio](https://developer.android.com/studio/index.html) or follow the [Android setup guide](https://reactnative.dev/docs/running-on-device#running-your-app-on-android-devices).
   - Run:
     ```bash
     cd android && gradle wrapper && cd ..
     ```
   - Then, execute:
     ```bash
     npx react-native run-android
     ```

---

## Building the App as an APK

1. Ensure you have the keystore and save it in `android/app`.
2. Copy `.env.example` to `.env` and fill in the correct environment variables for the keystore (file, password, etc.).
3. Ensure the `.env` file is being used (e.g., via `direnv`).
4. Build the app by running the following inside the `android` directory:
   ```bash
   ./gradlew assembleRelease
   ```
5. The APK will be generated in:
   ```bash
   android/app/build/outputs/apk/release/
   ```

### Keystore Setup

To bundle the app as an APK, you need a keystore.

1. Navigate to `android/app`.
2. Run the following command to create a new keystore:
   ```bash
   keytool -genkey -v -keystore wallet-keystore.keystore -alias wallet-keystore -keyalg RSA -keysize 2048 -validity 10000 -storetype jks
   ```
3. Copy `.env.example` and fill it with the keystore passwords.
4. Build the APK using:
   ```bash
   ./gradlew assembleRelease
   ```
5. The APK will be saved in `android/app/build/outputs/apk/release/`.

**Example `.env` file:**

```
KEYSTORE_FILE=wallet-keystore.keystore
KEYSTORE_PASSWORD=Togt215!
KEY_ALIAS=wallet-keystore
KEY_PASSWORD=Togt215!
```

---

## Developer Notes

1. The unused **RequestVC page** does not work and crashes due to a recursive loop.
2. The main menu has two buttons to open **CredentialViewScreen**, but both lead to the same screen.
3. The login screen is currently not in use.
4. All references to **presentation of the VCs** are not implemented.

---

## Testing Between the Wallet and Issuer Locally

This is written for Android users. Instructions for other devices will be added later.

To test the Wallet and/or Issuer, follow these steps:

1. Have the Issuer running via **Docker**.
2. Create an **Android Debug Bridge (ADB)** connection. [Options can be found here](https://developer.android.com/tools/adb). Using a **USB cable** is recommended for a stable connection.
3. Use **Android Studio** (or **IntelliJ**) to build and deploy the Wallet app on your phone.
4. (For Chrome) Open `chrome://inspect/#devices`.
   - Add **Port Forwarding**:
     - Gemeente: `5000`
     - DUO: `5001`
   - Confirm by visiting `localhost:5000` or `localhost:5001` on your phone.
   - If successful, you can scan the QR code from your localhost instance for testing.

### Alternative to Scanning QR Codes on an Emulator

If scanning a QR code doesn’t work on the emulator, copy the **URI beneath the QR code** and paste it into the text field above the camera feed in the emulator.
This will function the same as scanning a QR code.
