package com.awesomelibrary

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

import android.util.Log
import android.content.Context
import java.io.ByteArrayOutputStream
import java.io.File
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import android.util.Base64

class AwesomeLibraryModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    private val TAG = "AwesomeLibraryModule"

    override fun getName(): String {
        return "AwesomeLibrary"
    }

    @ReactMethod
    fun add(a: Double, b: Double, promise: Promise) {
        promise.resolve(nativeAdd(a, b))
    }

    @ReactMethod
    fun generateProof(
        zkeyPath: String, 
        circuitPath: String, 
        inputs: ReadableMap, 
        promise: Promise
    ) {
        Log.e(TAG, "zkeyPath: $zkeyPath")
        Log.e(TAG, "circuitPath: $circuitPath")
        Log.e(TAG, "inputs: ${inputs.toString()}")

        try {
            // Read the circuit file
            val circuitFile = File(circuitPath)
            if (!circuitFile.exists()) {
                throw IllegalArgumentException("Circuit file does not exist at path: $circuitPath")
            }

            val circuitBytes = try {
                circuitFile.readBytes()
            } catch (e: Exception) {
                throw IllegalArgumentException("Error reading circuit file: ${e.message}")
            }

            // Format inputs
            val formattedInputs = mutableMapOf<String, Any?>()
            val iterator = inputs.keySetIterator()
            while (iterator.hasNextKey()) {
                val key = iterator.nextKey()
                val array = inputs.getArray(key)?.toArrayList()?.map { it.toString() }
                formattedInputs[key] = if (array?.size == 1) array.firstOrNull() else array
            }

            val gson = GsonBuilder().setPrettyPrinting().create()
            Log.e(TAG, gson.toJson(formattedInputs))
            
            val jsonInputs = gson.toJson(formattedInputs).toByteArray()
            val zkpTools = ZKPTools(reactApplicationContext)


            val BUFFER_SIZE = 33 * 1024 * 1024 
            // val BUFFER_SIZE = 2 * 1024 * 1024 
            val witnessLen = LongArray(1).apply { this[0] = BUFFER_SIZE.toLong() }
            val witnessBuffer = ByteArray(BUFFER_SIZE)
            val errorMsg = ByteArray(1024)

            val witnessResult = zkpTools.witnesscalc_aadhaar_verifier(
                circuitBytes,
                circuitBytes.size.toLong(),
                jsonInputs,
                jsonInputs.size.toLong(),
                witnessBuffer,
                witnessLen,
                errorMsg,
                256
            )

            Log.e(TAG, "Witness generation result: $witnessResult")

            when (witnessResult) {
                3 -> throw Exception("Error 3")
                2 -> throw Exception("Not enough memory for witness calculation")
                1 -> throw Exception("Error during witness calculation: ${errorMsg.decodeToString()}")
            }

            val witnessData = witnessBuffer.copyOfRange(0, witnessLen[0].toInt())
            val base64Witness = Base64.encodeToString(witnessData, Base64.NO_WRAP)
            
            val result = mapOf(
                "witness" to base64Witness,
                "length" to witnessLen[0]
            )

            promise.resolve(gson.toJson(result))

            // how to send as witness file !?
            

            // var offset = 0

            // File(zkeyPath1).inputStream().buffered().use { input ->
            //     val buffer = ByteArray(8 * 1024) // 8KB chunks
            //     var bytesRead: Int
            //     while (input.read(buffer).also { bytesRead = it } != -1) {
            //         System.arraycopy(buffer, 0, combinedZkeyBytes, offset, bytesRead)
            //         offset += bytesRead
            //     }
            // }

            // // casing OOM For me here 
            // val zkeyBytes1 = File(zkeyPath1).readBytes()
            // val zkeyBytes2 = File(zkeyPath2).readBytes()
            // Thread {
            //     try {
            //         val zkeyBytes1 = File(zkeyPath1).readBytes()
            //         val zkeyBytes = zkeyBytes1 + zkeyBytes1                    
            //         promise.resolve("Success")
            //     } catch (e: Exception) {
            //         Log.e(TAG, "Error: ${e.message}")
            //         promise.reject("ERROR", e.message)
            //     }
            // }.start()

            // its failing here
            // val zkeyBytes1 = File(zkeyPath1).readBytes()

            // Thread.sleep(5000)
            // // sleep

            // val zkeyBytes2 = File(zkeyPath2).readBytes()
            
            // val proofResult = zkpTools.groth16_prover(
            //     zkeyBytes,
            //     zkeyBytes.size.toLong(),
            //     witnessBuffer.copyOfRange(0, witnessLen[0].toInt()),
            //     witnessLen[0],
            //     proofBuffer,
            //     proofSize,
            //     publicBuffer,
            //     publicSize,
            //     errorMsg,
            //     256
            // )

            // return promise.resolve("SUIIIIII from proofResult gg")
            // Log.e(TAG, "Proof generation result: $proofResult")

            // when (proofResult) {
            //     2 -> throw Exception("Not enough memory for proof generation")
            //     1 -> throw Exception("Error during proof generation: ${errorMsg.decodeToString()}")
            // }

            // // Format proof
            // val proofData = proofBuffer.copyOfRange(0, proofSize[0].toInt())
            // val pubData = publicBuffer.copyOfRange(0, publicSize[0].toInt())

            // val proofString = proofData.toString(Charsets.UTF_8)
            // val pubString = pubData.decodeToString()

            // val proofEndIndex = findLastIndexOfSubstring(proofString, "\"protocol\":\"groth16\"}")
            // val pubEndIndex = findLastIndexOfSubstring(pubString, "]")

            // val formattedProof = proofString.slice(0..proofEndIndex)
            // val formattedPubData = pubString.slice(0..pubEndIndex)

            // Log.e(TAG, "Formatted proof: $formattedProof")

            // val proof = Proof.fromJson(formattedProof)
            // val zkProof = ZkProof(
            //     proof = proof,
            //     pub_signals = getPubSignals(formattedPubData)
            // )

            // promise.resolve(gson.toJson(zkProof))
            
        } catch (e: Exception) {
            Log.e(TAG, "Error: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }

    private fun findLastIndexOfSubstring(mainString: String, searchString: String): Int {
        val index = mainString.lastIndexOf(searchString)
        return if (index != -1) {
            index + searchString.length - 1
        } else {
            -1
        }
    }

    private fun getPubSignals(jsonString: String): List<String> {
        return try {
            val gson = Gson()
            gson.fromJson(jsonString, Array<String>::class.java).toList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    private external fun nativeAdd(a: Double, b: Double): Double

    companion object {
        init {
            System.loadLibrary("rapidsnark")
            System.loadLibrary("anon-aadhaar-react-native")
        }
    }
}

data class Proof(
    val pi_a: List<String>,
    val pi_b: List<List<String>>,
    val pi_c: List<String>,
    val protocol: String,
    var curve: String = "bn128"
) {
    companion object {
        fun fromJson(jsonString: String): Proof {
            Log.d("Proof", jsonString)
            val json = Gson().fromJson(jsonString, Proof::class.java)
            json.curve = "bn128"
            return json
        }
    }
}

data class ZkProof(
    val proof: Proof,
    val pub_signals: List<String>
)

class ZKPTools(val context: Context) {
    external fun witnesscalc_aadhaar_verifier(
        circuitBuffer: ByteArray,
        circuitSize: Long,
        jsonBuffer: ByteArray,
        jsonSize: Long,
        wtnsBuffer: ByteArray,
        wtnsSize: LongArray,
        errorMsg: ByteArray,
        errorMsgMaxSize: Long
    ): Int

    external fun groth16_prover(
        zkeyBuffer: ByteArray, 
        zkeySize: Long,
        wtnsBuffer: ByteArray, 
        wtnsSize: Long,
        proofBuffer: ByteArray, 
        proofSize: LongArray,
        publicBuffer: ByteArray, 
        publicSize: LongArray,
        errorMsg: ByteArray, 
        errorMsgMaxSize: Long
    ): Int

    init {
        System.loadLibrary("rapidsnark")
        System.loadLibrary("anon-aadhaar-react-native")
    }
}