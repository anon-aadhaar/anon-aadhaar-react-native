package com.rapidsnark

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import android.util.Log
import android.content.Context
import java.io.ByteArrayOutputStream
import java.io.BufferedInputStream
import java.io.FileInputStream
import java.io.File
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import android.util.Base64

data class CircuitInputs(
    val circuitBuffer: ByteArray,
    val circuitSize: Long,
    val jsonBuffer: ByteArray,
    val jsonSize: Long,
    val wtnsBuffer: ByteArray,
    val wtnsSize: LongArray,
    val errorMsg: ByteArray,
    val errorMsgMaxSize: Long,
    val pubData: ByteArray,
    val pubLen: LongArray,
    val proofData: ByteArray,
    val proofLen: LongArray
)

fun readFileInChunks(filePath: String, chunkSize: Int = 2048): ByteArray {
    val file = File(filePath)
    val outputStream = ByteArrayOutputStream()

    BufferedInputStream(FileInputStream(file)).use { inputStream ->
        val buffer = ByteArray(chunkSize)
        var bytesRead: Int
        while (inputStream.read(buffer).also { bytesRead = it } != -1) {
            outputStream.write(buffer, 0, bytesRead)
        }
    }

    return outputStream.toByteArray()
}

fun prepareCircuitInputs(
    circuitPath: String,
    jsonBuffer: ByteArray,
): CircuitInputs {

    // 1. Load circuit data into circuitBuffer
    val circuitBuffer: ByteArray = readFileInChunks(circuitPath)
    val circuitSize: Long = circuitBuffer.size.toLong()

    // 2. Load JSON data into jsonBuffer
    // val jsonBuffer: ByteArray = readFileInChunks(jsonPath)
    val jsonSize: Long = jsonBuffer.size.toLong()

    // 3. Prepare witness buffer (initially empty)
    val wtnsBuffer: ByteArray = ByteArray(35 * 1024 * 1024) // Allocate buffer size
    val wtnsSize = LongArray(1)
    wtnsSize[0] = wtnsBuffer.size.toLong()

    // 4. Prepare error message buffer (initially empty)
    val errorMsg: ByteArray = ByteArray(256) // Set buffer size
    val errorMsgMaxSize: Long = errorMsg.size.toLong()

    // 5. Prepare public data and proof buffers
    val pubData = ByteArray(1 * 1024 * 1024)
    val pubLen = LongArray(1)
    pubLen[0] = pubData.size.toLong()

    val proofData = ByteArray(1 * 1024 * 1024)
    val proofLen = LongArray(1)
    proofLen[0] = proofData.size.toLong()

    // Return all prepared inputs
    return CircuitInputs(
        circuitBuffer,
        circuitSize,
        jsonBuffer,
        jsonSize,
        wtnsBuffer,
        wtnsSize,
        errorMsg,
        errorMsgMaxSize,
        pubData,
        pubLen,
        proofData,
        proofLen
    )
}

class RapidsnarkModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    private val TAG = "RapidsnarkModule"

    override fun getName(): String {
        return "Rapidsnark"
    }

    @ReactMethod
    fun add(a: Double, b: Double, promise: Promise) {
        promise.resolve(nativeAdd(a, b))
    }

    @ReactMethod
    fun groth16ProveWithZKeyFilePath(
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
    
            val rapidsnarkInputs = prepareCircuitInputs(
                circuitPath,
                jsonInputs  
            )
    
            val wtnsRes = zkpTools.witnesscalc_aadhaar_verifier(
                rapidsnarkInputs.circuitBuffer,
                rapidsnarkInputs.circuitSize,
                rapidsnarkInputs.jsonBuffer,
                rapidsnarkInputs.jsonSize,
                rapidsnarkInputs.wtnsBuffer,
                rapidsnarkInputs.wtnsSize,
                rapidsnarkInputs.errorMsg,
                rapidsnarkInputs.errorMsgMaxSize
            )
    
            Log.e(TAG, "Witness generation result: $wtnsRes")
    
            when (wtnsRes) {
                3 -> throw Exception("Error 3")
                2 -> throw Exception("Not enough memory for witness calculation")
                1 -> throw Exception("Error during witness calculation: ${rapidsnarkInputs.errorMsg.toString(Charsets.UTF_8).trim()}")
            }


            var proofRes = zkpTools.groth16ProveWithZKeyFilePath(
                zkeyPath,
                rapidsnarkInputs.wtnsBuffer,
                rapidsnarkInputs.wtnsSize[0],
                rapidsnarkInputs.proofData,
                rapidsnarkInputs.proofLen,
                rapidsnarkInputs.pubData,
                rapidsnarkInputs.pubLen,
                rapidsnarkInputs.errorMsg,
                rapidsnarkInputs.errorMsgMaxSize
            )

            when (proofRes) {
                2 -> throw Exception("Not enough memory for proof generation")
                1 -> throw Exception("Error during proof generation: ${rapidsnarkInputs.errorMsg.decodeToString()}")
            }

            val proofData =  rapidsnarkInputs.proofData.copyOfRange(0, rapidsnarkInputs.proofLen[0].toInt())
            val pubData =   rapidsnarkInputs.pubData.copyOfRange(0, rapidsnarkInputs.pubLen[0].toInt())
            val proofString = proofData.toString(Charsets.UTF_8)
            val pubString = pubData.decodeToString()

            val proofEndIndex = findLastIndexOfSubstring(proofString, "\"protocol\":\"groth16\"}")
            val pubEndIndex = findLastIndexOfSubstring(pubString, "]")

            val formattedProof = proofString.slice(0..proofEndIndex)
            val formattedPubData = pubString.slice(0..pubEndIndex)

            val proof = Proof.fromJson(formattedProof)
            val zkProof = ZkProof(
                proof = proof,
                pub_signals = getPubSignals(formattedPubData)
            )

            promise.resolve(gson.toJson(zkProof))   
        } catch (e: Exception) {
            Log.e(TAG, "Error: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun groth16Verify(
        proof: String,
        publicSignals: String,
        verificationKey: String,
        errorSize: Int,
        promise: Promise
    ) {
        try {
            Log.e(TAG, "Starting verification")
            
            val errorMsg = ByteArray(errorSize)
            val zkpTools = ZKPTools(reactApplicationContext)
            
            val verificationResult = zkpTools.groth16Verify(
                proof,
                publicSignals,
                verificationKey,
                errorMsg,
                errorSize.toLong()
            )

            when (verificationResult) {
                0 -> promise.resolve(true)  // Verification successful
                1 -> {
                    promise.resolve(false)  // Verification failed  
                }
                else -> throw Exception("Unknown verification error")
            }

        } catch (e: Exception) {
            Log.e(TAG, "Verification error: ${e.message}")
            promise.reject("VERIFICATION_ERROR", e.message)
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

    external fun groth16ProveWithZKeyFilePath(
        zkeyPath: String,
        wtnsBuffer: ByteArray, wtnsSize: Long,
        proofBuffer: ByteArray, proofSize: LongArray,
        publicBuffer: ByteArray, publicSize: LongArray,
        errorMsg: ByteArray, errorMsgMaxSize: Long
    ): Int

    external fun groth16Verify(
        proof: String,
        inputs: String,
        verificationKey: String,
        errorMsg: ByteArray,
        errorMsgMaxSize: Long
): Int

    init {
        System.loadLibrary("rapidsnark")
        System.loadLibrary("anon-aadhaar-react-native")
    }
}