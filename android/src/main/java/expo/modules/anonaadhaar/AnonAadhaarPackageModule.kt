package expo.modules.anonaadhaar

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import java.io.File
import uniffi.mopro.CircomProofResult
import uniffi.mopro.generateCircomProof
import uniffi.mopro.ProofLib
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import expo.modules.kotlin.exception.CodedException
import uniffi.mopro.*

fun convertType(proof: CircomProof): ExpoProof {
    var a = ExpoG1(proof.a.x, proof.a.y)
    var b = ExpoG2(proof.b.x, proof.b.y)
    var c = ExpoG1(proof.c.x, proof.c.y)
    var output = ExpoProof(a, b, c)
    return output
}
fun convertProofResult(proofResult: Result): CircomProofResult {
  val proof = proofResult.proof ?: throw NullPointerException("Proof cannot be null")
  val g1a = G1(proof.a?.x!!, proof.a?.y!!, "1")
  val g2b = G2(proof.b?.x!!, proof.b?.y!!, listOf("1", "0"))
  val g1c = G1(proof.c?.x!!, proof.c?.y!!, "1")
  
  val circomProof = CircomProof(g1a, g2b, g1c, "groth16", "bn128")
  var circomProofResult = CircomProofResult(circomProof, proofResult.inputs!!)
  return circomProofResult
}

fun generateProof(zkeyPath: String, circuitInputs: String): Result {
    val file = File(zkeyPath)
    val res = generateCircomProof(file.absolutePath, circuitInputs, ProofLib.RAPIDSNARK)
    val result = Result(convertType(res.proof), res.inputs)
    return result
  }

class AnonAadhaarPackageModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AnonAadhaarPackage')` in JavaScript.
    Name("AnonAadhaarPackage")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    // Convert to AsyncFunction
    AsyncFunction("generateCircomProof") { zkeyPath: String, circuitInputs: String ->
      // Return type is inferred Map<String, Any?>
      // The try-catch logic remains the same. Expo handles the Promise.
      try {
        val result = generateProof(zkeyPath, circuitInputs)
        // Convert the result to a serializable Map before returning
        return@AsyncFunction result
      } catch (e: MoproException) {
          throw CodedException("MoproGenerationError", "MoproException generating proof: ${e.message}", e)
      } catch (e: Exception) {
          throw CodedException("ProofGenerationError", "Unexpected error generating proof: ${e.message}", e)
      }
    }

    AsyncFunction("verifyProof") { zkeyPath: String, proofResult: Result ->
        try {
            val file = File(zkeyPath)
            val circomProofResult = convertProofResult(proofResult)
            val isValid = verifyCircomProof(
                zkeyPath = file.absolutePath,
                proofResult = circomProofResult,
                proofLib = ProofLib.RAPIDSNARK
            )
            // Return the result; Expo will resolve the promise automatically
            isValid
        } catch (e: MoproException) {
            throw CodedException("MoproVerificationError", "MoproException verifying proof: ${e.message}", e)
        } catch (e: CodedException) {
            throw e // rethrow so Expo passes proper code/message
        } catch (e: Exception) {
            throw CodedException("VerificationError", "Unexpected error verifying proof: ${e.message}", e)
        }
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(AnonAadhaarPackageView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: AnonAadhaarPackageView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }
}
