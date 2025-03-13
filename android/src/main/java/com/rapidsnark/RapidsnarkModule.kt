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
import uniffi.mopro.generateCircomProof
import uniffi.mopro.toEthereumInputs
import uniffi.mopro.toEthereumProof
import uniffi.mopro.fromEthereumProof
import uniffi.mopro.fromEthereumInputs
import uniffi.mopro.ProofCalldata
import uniffi.mopro.ProofLib
import uniffi.mopro.G1
import uniffi.mopro.G2

data class ModuleG1 (
    val x: String,
    val y: String
)

data class ModuleG2 (
    val x: List<String>,
    val y: List<String>
)


data class Proof(
    val pi_a: List<String>,
    val pi_b: List<List<String>>,
    val pi_c: List<String>,
    val protocol: String = "groth16",
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
    fun generateProof(
        zkeyPath: String,
        inputs: String,
        promise: Promise
    ) {
        try {
            val res = uniffi.mopro.generateCircomProof(zkeyPath, inputs, ProofLib.RAPIDSNARK)   
            val proof = toEthereumProof(res.proof)
            val moduleInputs = toEthereumInputs(res.inputs)
            var moduleProof = convertType(proof)
            val zkProof = ZkProof(
                proof = moduleProof,
                pub_signals = moduleInputs
            )
            val gson = GsonBuilder().setPrettyPrinting().create()
            promise.resolve(gson.toJson(zkProof))
        } catch (e: Exception) {
            Log.e(TAG, "Error: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun verifyProof(
        zkeyPath: String,
        proof: String,
        publicSignals: String,
        promise: Promise
    ) {
        try {
            val jsonProof = Proof.fromJson(proof)
            val ethereumProof = convertTypeFromModuleProof(jsonProof)
            val moproProof = fromEthereumProof(ethereumProof)

            val jsonInputs = getPubSignals(publicSignals)
            val moproInputs = fromEthereumInputs(jsonInputs)
            val res = uniffi.mopro.verifyCircomProof(zkeyPath, moproProof, moproInputs, ProofLib.RAPIDSNARK)
            promise.resolve(res)
        } catch (e: Exception) {
            Log.e(TAG, "Error: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }

    private fun convertTypeFromModuleProof(proof: Proof): ProofCalldata {
        val a = G1(
            x= proof.pi_a[0], 
            y= proof.pi_a[1]
        )
        val b = G2(
            x = listOf(proof.pi_b[0][0], proof.pi_b[0][1]),
            y = listOf(proof.pi_b[1][0], proof.pi_b[1][1])
        )
        val c = G1(
            x = proof.pi_c[0],
            y = proof.pi_c[1]
        )
        
        return ProofCalldata(a, b, c)
    }

    private fun convertType(proof: ProofCalldata): Proof {
        val pi_a = listOf(proof.a.x, proof.a.y, "1")
        val pi_b = listOf(listOf(proof.b.x[0], proof.b.x[1]), listOf(proof.b.y[0], proof.b.y[1]), listOf("1", "0"))
        val pi_c = listOf(proof.c.x, proof.c.y, "1")
        return Proof(pi_a, pi_b, pi_c)
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
}
