package com.DitlabWallet7.com

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.Signature

class SigningModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "SigningModule"

    @ReactMethod
    fun createSigningKeys(username: String, algorithm: String) {
        val kpg: KeyPairGenerator =
                when (algorithm) {
                    "RS256" ->
                            KeyPairGenerator.getInstance(
                                    KeyProperties.KEY_ALGORITHM_RSA,
                                    "AndroidKeyStore"
                            )
                    "ES256" ->
                            KeyPairGenerator.getInstance(
                                    KeyProperties.KEY_ALGORITHM_EC,
                                    "AndroidKeyStore"
                            )
                    else ->
                            KeyPairGenerator.getInstance(
                                    KeyProperties.KEY_ALGORITHM_EC,
                                    "AndroidKeyStore"
                            )
                }

        val builder = KeyGenParameterSpec.Builder(
                        username,
                        KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
                )
                .setDigests(KeyProperties.DIGEST_SHA256)
        
        // Apply algorithm-specific parameters
        if (algorithm == "RS256") {
            builder.setSignaturePaddings(KeyProperties.SIGNATURE_PADDING_RSA_PKCS1)
                  .setKeySize(2048)
        } else {
            // For ES256, specify the EC curve to be P-256 (secp256r1)
            builder.setAlgorithmParameterSpec(java.security.spec.ECGenParameterSpec("secp256r1"))
        }

        val parameterSpec = builder.build()
        kpg.initialize(parameterSpec)
        val keypair = kpg.generateKeyPair()
        Log.d("SigningModule", "Created key pair for algorithm: $algorithm")
    }

    @ReactMethod
    fun signJwt(jwt: String, algorithm: String, username: String, callback: Callback) {
        val header = "{\"alg\":\"${algorithm}\",\"typ\":\"JWT\"}"
        val encodedHeader =
                Base64.encodeToString(header.toByteArray(), Base64.URL_SAFE or Base64.NO_PADDING)
        val encodedJwt =
                Base64.encodeToString(jwt.toByteArray(), Base64.URL_SAFE or Base64.NO_PADDING)
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val entry = ks.getEntry(username, null) as? KeyStore.PrivateKeyEntry
        if (entry !is KeyStore.PrivateKeyEntry) {
            Log.w("Signing", "Not an instance of PrivateKeyEntry")
            callback(null)
            return
        }
        
        // Select appropriate signature algorithm based on the requested algorithm
        val signatureAlgorithm = when (algorithm) {
            "RS256" -> "SHA256withRSA"
            "ES256" -> "SHA256withECDSA"
            else -> "SHA256withECDSA" // Default to ES256
        }
        
        Log.d("SigningModule", "Using signature algorithm: $signatureAlgorithm")
        
        val signature =
                Signature.getInstance(signatureAlgorithm).run {
                    initSign(entry.privateKey)
                    update("$encodedHeader.$encodedJwt".toByteArray())
                    sign()
                }

        val signatureEncoded =
                Base64.encodeToString(signature, Base64.URL_SAFE or Base64.NO_PADDING)
        val signedJwt = "${encodedHeader.trim()}.${encodedJwt.trim()}.${signatureEncoded.trim()}"
        Log.d("JWT", signedJwt)
        Log.d("JWT", "Payload Base64: $encodedJwt")
        Log.d(
                "JWT",
                "Public key: ${Base64.encodeToString(entry.certificate.publicKey.encoded, Base64.DEFAULT)}"
        )
        callback(signedJwt)
    }

    @ReactMethod
    fun getPublicKey(username: String, callback: Callback) {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val entry = ks.getEntry(username, null) as? KeyStore.PrivateKeyEntry
        val pubKey = entry?.certificate?.publicKey?.encoded
        if (pubKey != null) {
            callback(
                    "-----BEGIN PUBLIC KEY-----${Base64.encodeToString(pubKey, Base64.NO_PADDING)}-----END PUBLIC KEY-----"
            )
        } else {
            Log.e("SigningModule", "Could not retrieve public key for $username")
            callback(null)
        }
    }
}
