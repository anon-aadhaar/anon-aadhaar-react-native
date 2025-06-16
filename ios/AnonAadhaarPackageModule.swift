import ExpoModulesCore
import moproFFI

func convertType(proof: CircomProof) -> ExpoProof {
  var a = ExpoG1()
  a.x = proof.a.x
  a.y = proof.a.y

  var b = ExpoG2()
  b.x = proof.b.x
  b.y = proof.b.y

  var c = ExpoG1()
  c.x = proof.c.x
  c.y = proof.c.y

  var expoProof = ExpoProof()
  expoProof.a = a
  expoProof.b = b
  expoProof.c = c
  return expoProof
}

func convertProofResult(proofResult: Result) -> CircomProofResult {
  guard let proof = proofResult.proof,
        let a = proof.a,
        let b = proof.b,
        let c = proof.c,
        let inputs = proofResult.inputs else {
    fatalError("Invalid proof result")
  }
  
  let g1a = G1(x: a.x ?? "0", y: a.y ?? "0", z: "1")
  let g2b = G2(x: b.x ?? ["1","0"], y: b.y ?? ["1","0"], z: ["1","0"])
  let g1c = G1(x: c.x ?? "0", y: c.y ?? "0", z: "1")
  
  let circomProof = CircomProof(a: g1a, b: g2b, c: g1c, protocol: "groth16", curve: "bn128")
  let circomProofResult = CircomProofResult(proof: circomProof, inputs: inputs)
  return circomProofResult
}

public class AnonAadhaarPackageModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AnonAadhaarPackage')` in JavaScript.
    Name("AnonAadhaarPackage")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Convert to AsyncFunction
    AsyncFunction("generateCircomProof") {
      (zkeyPath: String, circuitInputs: String) -> Result in // Return Dictionary
      // The logic remains the same, but Expo handles the async execution
      // and promise resolution/rejection based on throws.
      do {
          let res = try generateCircomProof(
            zkeyPath: zkeyPath, circuitInputs: circuitInputs, proofLib: ProofLib.rapidsnark)
          let result = Result()
          result.inputs = res.inputs
          result.proof = convertType(proof: res.proof)
          return result
      } catch let error as MoproError {
          print("MoproError generating proof: \(error)")
          throw Exception(name: "MoproGenerationError", description: "MoproError generating proof: \(error)")
      } catch {
          print("Unexpected error generating proof: \(error)")
          throw Exception(name: "ProofGenerationError", description: "Unexpected error generating proof: \(error.localizedDescription)")
      }
    }

    AsyncFunction("verifyProof") {
      (zkeyPath: String, proofResult: Result) -> Bool in
      do {
        // Call the verifyCircomProof function from mopro.swift
        // Using ProofLib.arkworks to match generation
        let isValid = try verifyCircomProof(
            zkeyPath: zkeyPath,
            proofResult: convertProofResult(proofResult: proofResult),
            proofLib: ProofLib.rapidsnark
        )
        return isValid
      } catch let error as MoproError {
          print("MoproError verifying proof: \(error)")
          throw Exception(name: "MoproVerificationError", description: "MoproError verifying proof: \(error)")
      } catch {
          print("Unexpected error verifying proof: \(error)")
          throw Exception(name: "VerificationError", description: "Unexpected error verifying proof: \(error.localizedDescription)")
      }
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent(
        "onChange",
        [
          "value": value
        ])
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(AnonAadhaarPackageView.self) {
      // Defines a setter for the `url` prop.
      Prop("url") { (view: AnonAadhaarPackageView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }
}
