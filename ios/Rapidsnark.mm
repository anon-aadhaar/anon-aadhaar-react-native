#import "Rapidsnark.h"

#import <React/RCTLog.h>
#import "RapidsnarkFramework.h"
#import "WitnesscalcFramework.h"

@implementation Rapidsnark
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(groth16ProveWithZKeyFilePath:(nonnull NSArray *)chunkPaths
                  datPath:(nonnull NSString *)datPath
                  inputs:(nonnull NSDictionary *)inputs
                  proofBufferSize:(nonnull NSNumber *)proofBufferSize
                  publicBufferSize:(nonnull NSNumber *)publicBufferSize
                  errBufferSize:(nonnull NSNumber *)errBufferSize
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    // Initialize empty witness buffer with expected size of about 33MB
    const unsigned long expectedWitnessSize = 100 * 1024 * 1024; // 100MB for safety
    NSMutableData *wtnsData = [NSMutableData dataWithLength:expectedWitnessSize];
    const void *wtns_buffer = [wtnsData bytes];
    unsigned long wtns_size = [wtnsData length];

    NSString *errorString = nil;
        // Calculate the witness from .dat file and inputs
        if (!calculateWitnessFromDatAndInputs(datPath, inputs, &wtnsData, &errorString)) {
            RCTLogError(@"Error calculating witness: %@", errorString);
            reject(@"witness_calculation_error", errorString, nil);
            return;
        }
    wtns_buffer = [wtnsData bytes];
    wtns_size = [wtnsData length];

    unsigned long proof_size = (unsigned long) [proofBufferSize intValue];
    char proof_buffer[proof_size];

    unsigned long public_buffer_size = (unsigned long) [publicBufferSize intValue];
    char public_buffer[public_buffer_size];

    unsigned long error_msg_maxsize = (unsigned long) [errBufferSize intValue];
    char error_msg[error_msg_maxsize];

    NSMutableData *zkeyData = [NSMutableData data];
    for (NSString *chunkPath in chunkPaths) {
    NSData *chunk = [NSData dataWithContentsOfFile:chunkPath];
    [zkeyData appendData:chunk];
    }

    // Now `zkeyData` contains your combined zkey buffer, and you can get its size
    unsigned long zkeySize = [zkeyData length];

    // Convert `zkeyData` to a buffer for use with your C function
    const void *zkeyBuffer = [zkeyData bytes];

    int statusCode = groth16_prover(
      zkeyBuffer, zkeySize,
      wtns_buffer, wtns_size,
      proof_buffer, &proof_size,
      public_buffer, &public_buffer_size,
      error_msg, error_msg_maxsize
    );

    if (statusCode != PROVER_OK) {
      NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
      RCTLogError(@"Error:%@", errorString);
      reject([NSString stringWithFormat:@"%d", statusCode], errorString, nil);
      return;
    }

    NSString *proofResult = [NSString stringWithCString:proof_buffer encoding:NSUTF8StringEncoding];
    NSString *publicResult = [NSString stringWithCString:public_buffer encoding:NSUTF8StringEncoding];

    if (proofResult.length > 0) {
      NSDictionary *resultDict = @{@"proof": proofResult, @"pub_signals": publicResult};
      resolve(resultDict);
    } else {
      NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
      RCTLogInfo(@"Error:%@", errorString);

      reject([NSString stringWithFormat:@"%d", statusCode], errorString, nil);
    }
}

RCT_EXPORT_METHOD(groth16Verify:(nonnull NSString *)proof
        inputs:(nonnull NSString *)inputs
        verification_key:(nonnull NSString *)verification_key
        errBufferSize:(nonnull NSNumber *)errBufferSize
        resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject)
{
    // Convert NSString to C-style strings
    const char *cProof = [proof UTF8String];
    const char *cInputs = [inputs UTF8String];
    const char *cVerificationKey = [verification_key UTF8String];

    unsigned long error_msg_maxsize = (unsigned long) [errBufferSize intValue];
    char error_msg[error_msg_maxsize];

    // Call the Rust function
    int result = groth16_verify(cProof, cInputs, cVerificationKey, error_msg, error_msg_maxsize);

    if (result != VERIFIER_ERROR) {
      bool proofValid = result == VERIFIER_VALID_PROOF;
      resolve(@(proofValid));
    } else {
      NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
      RCTLogError(@"Error:%@", errorString);
      reject([NSString stringWithFormat:@"%d", result], errorString, nil);
    }
}

RCT_EXPORT_METHOD(groth16PublicSizeForZkeyFile:(nonnull NSString *)zkey_file_path
                  errBufferSize:(nonnull NSNumber *)errBufferSize
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    const char *file_path = [zkey_file_path UTF8String];

    unsigned long error_msg_maxsize = (unsigned long) [errBufferSize intValue];
    char error_msg[error_msg_maxsize];

    unsigned long public_buffer_size = 0;

    int status_code = groth16_public_size_for_zkey_file(
      file_path,
      &public_buffer_size,
      error_msg, error_msg_maxsize
    );

    if (status_code == PROVER_OK) {
      resolve(@(public_buffer_size));
    } else {
      NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
      RCTLogError(@"Error:%@", errorString);
      reject([NSString stringWithFormat:@"%d", status_code], errorString, nil);
    }
}

RCT_EXPORT_METHOD(groth16PublicSizeForChunkedZkeyFile:(nonnull NSArray *)chunkPaths
                  errBufferSize:(nonnull NSNumber *)errBufferSize
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSMutableData *zkeyData = [NSMutableData data];
    for (NSString *chunkPath in chunkPaths) {
        NSData *chunk = [NSData dataWithContentsOfFile:chunkPath];
        [zkeyData appendData:chunk];
    }

    // Now `zkeyData` contains your combined zkey buffer, and you can get its size
    unsigned long zkeySize = [zkeyData length];

    // Convert `zkeyData` to a buffer for use with your C function
    const void *zkeyBuffer = [zkeyData bytes];

    unsigned long error_msg_maxsize = (unsigned long) [errBufferSize intValue];
    char error_msg[error_msg_maxsize];

    unsigned long public_buffer_size = 0;

    int status_code = groth16_public_size_for_zkey_buf(
    zkeyBuffer,zkeySize,
      &public_buffer_size,
      error_msg, error_msg_maxsize
    );

    if (status_code == PROVER_OK) {
      resolve(@(public_buffer_size));
    } else {
      NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
      RCTLogError(@"Error:%@", errorString);
    RCTLogError(@"Error here in Chunked Zkey file size");
      reject([NSString stringWithFormat:@"%d", status_code], errorString, nil);
    }
}

BOOL calculateWitnessFromDatAndInputs(NSString *datFilePath, NSDictionary *inputs, NSData **witnessData, NSString **errorString) {
    NSError *error = nil;
    NSData *circuitData = [NSData dataWithContentsOfFile:datFilePath options:0 error:&error];
    if (!circuitData) {
        *errorString = [NSString stringWithFormat:@"Failed to load circuit data: %@", error.localizedDescription];
        return NO;
    }
    
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:inputs options:0 error:&error];
    if (!jsonData) {
        *errorString = [NSString stringWithFormat:@"Failed to serialize inputs to JSON: %@", error.localizedDescription];
        return NO;
    }
    
    unsigned long wtns_size = 0;
    const unsigned long expectedWitnessSize = 100 * 1024 * 1024;
    NSMutableData *wtnsData = [NSMutableData dataWithLength:expectedWitnessSize]; // Define EXPECTED_WITNESS_SIZE accordingly
    char error_msg[1024] = {0}; // Adjust error message buffer size as needed
    const char *circuit_buffer = (const char *)[circuitData bytes];
    const char *json_buffer = (const char *)[jsonData bytes];
    char *wtns_buffer = (char *)[wtnsData mutableBytes];
    
    wtns_size = [wtnsData length];
    
    int result = witnesscalc_aadhaar_verifier(circuit_buffer, [circuitData length], json_buffer, [jsonData length], wtns_buffer, &wtns_size, error_msg, sizeof(error_msg));
    
    if (result != 0) {
        *errorString = [NSString stringWithUTF8String:error_msg];
        return NO;
    }
    
    *witnessData = [wtnsData subdataWithRange:NSMakeRange(0, wtns_size)];
    return YES;
}

@end
