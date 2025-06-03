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

fun generateProof(zkeyPath: String, circuitInputs: String): CircomProofResult {
  val file = File(zkeyPath)
  val res = generateCircomProof(file.absolutePath, circuitInputs, ProofLib.ARKWORKS)
  return res
}

// --- Add Manual Conversion ---
fun convertG1ToMap(g1: G1): Map<String, String> {
    return mapOf("x" to g1.x, "y" to g1.y, "z" to g1.z)
}

fun convertG2ToMap(g2: G2): Map<String, List<String>> {
    return mapOf("x" to g2.x, "y" to g2.y, "z" to g2.z)
}

fun convertCircomProofToMap(proof: CircomProof): Map<String, Any?> {
    return mapOf(
        "a" to convertG1ToMap(proof.a),
        "b" to convertG2ToMap(proof.b),
        "c" to convertG1ToMap(proof.c),
        "protocol" to proof.protocol,
        "curve" to proof.curve
    )
}

fun convertCircomProofResultToMap(result: CircomProofResult): Map<String, Any?> {
    return mapOf(
        "proof" to convertCircomProofToMap(result.proof),
        "inputs" to result.inputs
    )
}
// --- End Manual Conversion ---

// Helper function to parse ReadableMap to G1
fun parseReadableMapToG1(map: ReadableMap): G1 {
    val x = map.getString("x") ?: throw CodedException("ParseError", "Missing 'x' in G1", null)
    val y = map.getString("y") ?: throw CodedException("ParseError", "Missing 'y' in G1", null)
    val z = map.getString("z") ?: throw CodedException("ParseError", "Missing 'z' in G1", null)
    return G1(x = x, y = y, z = z)
}

// Helper function to parse ReadableMap to G2
fun parseReadableMapToG2(map: ReadableMap): G2 {
    val x = map.getArray("x")?.toStringList()
        ?: throw CodedException("ParseError", "Missing or invalid 'x' in G2", null)
    val y = map.getArray("y")?.toStringList()
        ?: throw CodedException("ParseError", "Missing or invalid 'y' in G2", null)
    val z = map.getArray("z")?.toStringList()
        ?: throw CodedException("ParseError", "Missing or invalid 'z' in G2", null)
    return G2(x = x, y = y, z = z)
}

// Helper function to parse ReadableMap to CircomProof
fun parseReadableMapToCircomProof(map: ReadableMap): CircomProof {
    val aMap = map.getMap("a") ?: throw CodedException("ParseError", "Missing 'a' in CircomProof", null)
    val bMap = map.getMap("b") ?: throw CodedException("ParseError", "Missing 'b' in CircomProof", null)
    val cMap = map.getMap("c") ?: throw CodedException("ParseError", "Missing 'c' in CircomProof", null)
    val protocol = map.getString("protocol") ?: throw CodedException("ParseError", "Missing 'protocol' in CircomProof", null)
    val curve = map.getString("curve") ?: throw CodedException("ParseError", "Missing 'curve' in CircomProof", null)

    val a = parseReadableMapToG1(aMap)
    val b = parseReadableMapToG2(bMap)
    val c = parseReadableMapToG1(cMap)

    return CircomProof(a = a, b = b, c = c, protocol = protocol, curve = curve)
}

// Helper function to parse ReadableMap to CircomProofResult
fun parseReadableMapToCircomProofResult(map: ReadableMap): CircomProofResult {
    val proofMap = map.getMap("proof") ?: throw CodedException("ParseError", "Missing 'proof' in CircomProofResult", null)
    val inputs = map.getArray("inputs")?.toStringList()
        ?: throw CodedException("ParseError", "Missing or invalid 'inputs' in CircomProofResult", null)

    val proof = parseReadableMapToCircomProof(proofMap)
    return CircomProofResult(proof = proof, inputs = inputs)
}

// --- Add ReadableArray helpers ---
private fun ReadableArray.toAnyList(): List<Any?> {
    val list = mutableListOf<Any?>()
    for (i in 0 until this.size()) {
        when (this.getType(i)) {
            ReadableType.Null -> list.add(null)
            ReadableType.Boolean -> list.add(this.getBoolean(i))
            ReadableType.Number -> list.add(this.getDouble(i))
            ReadableType.String -> list.add(this.getString(i))
            ReadableType.Map -> list.add(this.getMap(i))
            ReadableType.Array -> list.add(this.getArray(i))
        }
    }
    return list
}

private fun ReadableArray.toStringList(): List<String> = (0 until this.size())
    .mapNotNull { this.getString(it) }
// --- End ReadableArray helpers ---

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
        val proofResult = generateProof(zkeyPath, circuitInputs)
        // Convert the result to a serializable Map before returning
        return@AsyncFunction convertCircomProofResultToMap(proofResult)
      } catch (e: MoproException) {
          throw CodedException("MoproGenerationError", "MoproException generating proof: ${e.message}", e)
      } catch (e: Exception) {
          throw CodedException("ProofGenerationError", "Unexpected error generating proof: ${e.message}", e)
      }
    }

    AsyncFunction("verifyProof") { zkeyPath: String, proofResultMap: ReadableMap ->
        try {
            val file = File(zkeyPath)
            val parsedProofResult = parseReadableMapToCircomProofResult(proofResultMap)
            val isValid = verifyCircomProof(
                zkeyPath = file.absolutePath,
                proofResult = parsedProofResult,
                proofLib = ProofLib.ARKWORKS
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
