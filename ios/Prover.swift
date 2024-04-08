import Foundation
import React
import Security

#if canImport(libwitnesscalc_aadhaar_verifier)
import libwitnesscalc_aadhaar_verifier
#endif

#if canImport(groth16_prover)
import groth16_prover
#endif

#if canImport(groth16_verify)
import groth16_verify
#endif

struct Proof: Codable {
    let piA: [String]
    let piB: [[String]]
    let piC: [String]
    let proofProtocol: String

    enum CodingKeys: String, CodingKey {
        case piA = "pi_a"
        case piB = "pi_b"
        case piC = "pi_c"
        case proofProtocol = "protocol"
    }
}

@available(iOS 15, *)
@objc(Prover)
class Prover: NSObject {
    @objc(downloadZkey:resolve:reject:)
    func downloadZkey(urlString: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        print("Downloading file...")

        guard let url = URL(string: urlString) else {
            reject("URL_ERROR", "Invalid URL", NSError(domain: "", code: 0, userInfo: nil))
            return
        }

        DispatchQueue.global(qos: .userInitiated).async {
            let session = URLSession(configuration: .default)
            let downloadTask = session.downloadTask(with: url) { (tempLocalUrl, response, error) in
                if let tempLocalUrl = tempLocalUrl, error == nil {
                    do {
                        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
                        let destinationURL = documentsPath.appendingPathComponent(url.lastPathComponent)

                        if FileManager.default.fileExists(atPath: destinationURL.path) {
                            try FileManager.default.removeItem(at: destinationURL)
                        }

                        try FileManager.default.moveItem(at: tempLocalUrl, to: destinationURL)
                        print("File downloaded to: \(destinationURL)")

                        DispatchQueue.main.async {
                            resolve(destinationURL.path)
                        }
                    } catch (let writeError) {
                        DispatchQueue.main.async {
                            reject("FILE_ERROR", "Error saving file", writeError)
                        }
                    }
                } else {
                    DispatchQueue.main.async {
                        reject("DOWNLOAD_ERROR", "Error downloading file: \(error?.localizedDescription ?? "Unknown error")", error as NSError?)
                    }
                }
            }
            downloadTask.resume()
        }
    }

    @objc(runProveAction:resolve:reject:)
    func runProveAction(_ inputs: [String: [String]], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            let inputsJson = try! JSONEncoder().encode(inputs)
            print("inputs size: \(inputsJson.count) bytes")
            print("inputs data: \(String(data: inputsJson, encoding: .utf8) ?? "")")
            
            let wtns = try! calcWtns(inputsJson: inputsJson)
            print("wtns size: \(wtns.count) bytes")

            let (proofRaw, pubSignalsRaw) = try groth16prove(wtns: wtns)
            let proof = try JSONDecoder().decode(Proof.self, from: proofRaw)
            let pubSignals = try JSONDecoder().decode([String].self, from: pubSignalsRaw)

            let proofObject: [String: Any] = [
                "proof": [
                "a": proof.piA,
                "b": proof.piB,
                "c": proof.piC,
                ],
                "inputs": pubSignals
            ]

            let proofData = try JSONSerialization.data(withJSONObject: proofObject, options: [])
            let proofObjectString = String(data: proofData, encoding: .utf8) ?? ""
            print("Whole proof: \(proofObjectString)")
            resolve(proofObjectString)
        } catch {
            print("Unexpected error: \(error)")
            reject("PROVER", "An error occurred during proof generation", error)
        }
    }

    @objc(groth16Verify:inputs:resolve:reject:)
    func groth16Verify(_ proof: String, _ inputs: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            // Load the verification key from the main bundle
            guard let fileURL = Bundle.main.url(forResource: "vkey", withExtension: "json"),
                  let vkeyData = try? Data(contentsOf: fileURL) else {
                throw NSError(domain: "com.yourdomain.yourapp", code: 1001, userInfo: [NSLocalizedDescriptionKey: "File not found in the main bundle."])
            }
            
            // Attempt to decode the verification key data
            guard let vkeyString = String(data: vkeyData, encoding: .utf8) else {
                throw NSError(domain: "com.yourdomain.yourapp", code: 1004, userInfo: [NSLocalizedDescriptionKey: "Unable to decode verification key data."])
            }
            
            // Allocate error buffer for potential verification errors
            let errorSize = UInt(256)
            let errorBuffer = UnsafeMutablePointer<UInt8>.allocate(capacity: Int(errorSize))
            defer {
                errorBuffer.deallocate() // Ensure deallocation to avoid memory leaks
            }

            // Deserialize the proof and inputs from JSON strings
            guard let proofData = proof.data(using: .utf8),
                  let inputsData = inputs.data(using: .utf8) else {
                throw NSError(domain: "com.yourdomain.yourapp", code: 1007, userInfo: [NSLocalizedDescriptionKey: "Failed to convert proof or inputs string to data."])
            }

            let proofObjectRaw = try JSONSerialization.jsonObject(with: proofData, options: [])
            let inputsArrayRaw = try JSONSerialization.jsonObject(with: inputsData, options: [])
            
            guard let proofObject = proofObjectRaw as? NSDictionary else {
                throw NSError(domain: "com.yourdomain.yourapp", code: 1009, userInfo: [NSLocalizedDescriptionKey: "Proof JSON is not a valid dictionary."])
            }

            guard let inputsArray = inputsArrayRaw as? [Any] else {
                throw NSError(domain: "com.yourdomain.yourapp", code: 1010, userInfo: [NSLocalizedDescriptionKey: "Inputs JSON is not a valid array."])
            }

            // Serialize objects back into JSON strings for C function
            let serializedProofData = try JSONSerialization.data(withJSONObject: proofObject, options: [])
            let serializedInputsData = try JSONSerialization.data(withJSONObject: inputsArray, options: [])
            guard let serializedProofString = String(data: serializedProofData, encoding: .utf8),
                  let serializedInputsString = String(data: serializedInputsData, encoding: .utf8) else {
                throw NSError(domain: "com.yourdomain.yourapp", code: 1011, userInfo: [NSLocalizedDescriptionKey: "Failed to serialize objects back to strings."])
            }

            // Convert JSON strings to C strings
            let proofCString = serializedProofString.cString(using: .utf8)
            let inputsCString = serializedInputsString.cString(using: .utf8)
            let vkeyCString = vkeyString.cString(using: .utf8)

            guard let proofC = proofCString, let inputsC = inputsCString, let vkeyC = vkeyCString else {
                throw NSError(domain: "com.yourdomain.yourapp", code: 1008, userInfo: [NSLocalizedDescriptionKey: "Error converting JSON strings to C strings."])
            }

            // Assuming groth16_verify exists and is correctly implemented to accept C strings
            // Call the C function with C strings
            let result = groth16_verify(proofC, inputsC, vkeyC, errorBuffer, errorSize)
            
            // Check verification result
            if result == 1 {
                resolve(true)
            } else {
                // Error handling for verification failure
                let errorMsg = String(cString: errorBuffer)
                reject("VERIFIER", "Verification failed: \(errorMsg)", NSError(domain: "com.yourdomain.yourapp", code: 1006, userInfo: nil))
            }
        } catch {
            // General error handling
            reject("VERIFIER", "An error occurred: \(error.localizedDescription)", error)
        }
    }


}

public func calcWtns(inputsJson: Data) throws -> Data {
    var fileData: Data? = nil

    if let fileURL = Bundle.main.url(forResource: "aadhaar_verifier", withExtension: "dat") {
        do {
            // Load the file's data
            fileData = try Data(contentsOf: fileURL)
            print("File data loaded successfully.")
        } catch {
            print("Failed to load file data: \(error.localizedDescription)")
            throw error // Rethrow the error or handle it as needed
        }
    } else {
        print("File aadhaar_verifier.dat not found in the main bundle.")
        throw NSError(domain: "com.yourdomain.yourapp", code: 1001, userInfo: [NSLocalizedDescriptionKey: "File aadhaar_verifier.dat not found in the main bundle."])
    }

    guard let data = fileData else {
        // Handle the case where fileData is nil (though you already threw an error if the file wasn't found)
        throw NSError(domain: "com.yourdomain.yourapp", code: 1002, userInfo: [NSLocalizedDescriptionKey: "Unable to load file data for aadhaar_verifier.dat."])
    }
    return try _calcWtns(dat: data, jsonData: inputsJson)
}

private func _calcWtns(dat: Data, jsonData: Data) throws -> Data {
    let datSize = UInt(dat.count)
    let jsonDataSize = UInt(jsonData.count)

    let errorSize = UInt(256);
    
    let wtnsSize = UnsafeMutablePointer<UInt>.allocate(capacity: Int(1));
    wtnsSize.initialize(to: UInt(100 * 1024 * 1024 ))
    
    let wtnsBuffer = UnsafeMutablePointer<UInt8>.allocate(capacity: (100 * 1024 * 1024))
    let errorBuffer = UnsafeMutablePointer<UInt8>.allocate(capacity: Int(errorSize))
    
    let result = witnesscalc_aadhaar_verifier(
        (dat as NSData).bytes, datSize,
        (jsonData as NSData).bytes, jsonDataSize,
        wtnsBuffer, wtnsSize,
        errorBuffer, errorSize
    )
    
    if result == WITNESSCALC_ERROR {
        let errorMessage = String(bytes: Data(bytes: errorBuffer, count: Int(errorSize)), encoding: .utf8)!
        .replacingOccurrences(of: "\0", with: "")
        throw NSError(domain: "WitnessCalculationError", code: Int(WITNESSCALC_ERROR), userInfo: [NSLocalizedDescriptionKey: errorMessage])
    }

    if result == WITNESSCALC_ERROR_SHORT_BUFFER {
        let shortBufferMessage = "Short buffer, required size: \(wtnsSize.pointee)"
        throw NSError(domain: "WitnessCalculationError", code: Int(WITNESSCALC_ERROR_SHORT_BUFFER), userInfo: [NSLocalizedDescriptionKey: shortBufferMessage])
    }
    return Data(bytes: wtnsBuffer, count: Int(wtnsSize.pointee))
}

public func groth16prove(wtns: Data) throws -> (proof: Data, publicInputs: Data) {
    var fileData: Data? = nil

    if let fileURL = Bundle.main.url(forResource: "circuit_final", withExtension: "zkey") {
        do {
            // Load the file's data
            fileData = try Data(contentsOf: fileURL)
            print("File data loaded successfully.")
        } catch {
            print("Failed to load file data: \(error.localizedDescription)")
            throw error // Rethrow the error or handle it as needed
        }
    } else {
        print("File aadhaar_verifier.dat not found in the main bundle.")
        throw NSError(domain: "com.yourdomain.yourapp", code: 1001, userInfo: [NSLocalizedDescriptionKey: "File aadhaar_verifier.dat not found in the main bundle."])
    }

    guard let zkeyData = fileData else {
        // Handle the case where fileData is nil (though you already threw an error if the file wasn't found)
        throw NSError(domain: "com.yourdomain.yourapp", code: 1002, userInfo: [NSLocalizedDescriptionKey: "Unable to load file data for aadhaar_verifier.dat."])
    }
    
    return try _groth16Prover(zkey: zkeyData, wtns: wtns)
}

public func _groth16Prover(zkey: Data, wtns: Data) throws -> (proof: Data, publicInputs: Data) {
    let zkeySize = zkey.count
    let wtnsSize = wtns.count
    
    var proofSize: UInt = 4 * 1024 * 1024
    var publicSize: UInt = 4 * 1024 * 1024
    
    let proofBuffer = UnsafeMutablePointer<UInt8>.allocate(capacity: Int(proofSize))
    let publicBuffer = UnsafeMutablePointer<UInt8>.allocate(capacity: Int(publicSize))
    
    let errorBuffer = UnsafeMutablePointer<Int8>.allocate(capacity: 256)
    let errorMaxSize: UInt = 256
    
    let result = groth16_prover(
        (zkey as NSData).bytes, UInt(zkeySize),
        (wtns as NSData).bytes, UInt(wtnsSize),
        proofBuffer, &proofSize,
        publicBuffer, &publicSize,
        errorBuffer, errorMaxSize
    )
    if result == PROVER_ERROR {
        let errorMessage = String(bytes: Data(bytes: errorBuffer, count: Int(errorMaxSize)), encoding: .utf8)!
        .replacingOccurrences(of: "\0", with: "")
        throw NSError(domain: "", code: Int(result), userInfo: [NSLocalizedDescriptionKey: errorMessage])
    }
    
    if result == PROVER_ERROR_SHORT_BUFFER {
        let shortBufferMessage = "Proof or public inputs buffer is too short"
        throw NSError(domain: "", code: Int(result), userInfo: [NSLocalizedDescriptionKey: shortBufferMessage])
    }
    var proof = Data(bytes: proofBuffer, count: Int(proofSize))
    var publicInputs = Data(bytes: publicBuffer, count: Int(publicSize))
    
    let proofNullIndex = proof.firstIndex(of: 0x00)!
    let publicInputsNullIndex = publicInputs.firstIndex(of: 0x00)!
    
    proof = proof[0..<proofNullIndex]
    publicInputs = publicInputs[0..<publicInputsNullIndex]
    
    return (proof: proof, publicInputs: publicInputs)
}
