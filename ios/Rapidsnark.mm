// #import "Rapidsnark.h"

// #import <React/RCTLog.h>
// #import "RapidsnarkFramework.h"
// #import "libwitnesscalc_aadhaar_verifier.h"

// @implementation Rapidsnark
// RCT_EXPORT_MODULE()

// RCT_EXPORT_METHOD(groth16Prove:(nonnull NSString *)zkeyBytes1
//                   witnessData:(nonnull NSString *)wtnsBytes1
//                   proofBufferSize:(nonnull NSNumber *)proofBufferSize
//                   publicBufferSize:(nonnull NSNumber *)publicBufferSize
//                   errBufferSize:(nonnull NSNumber *)errBufferSize
//                   resolve:(RCTPromiseResolveBlock)resolve
//                   reject:(RCTPromiseRejectBlock)reject)
// {
//     // NSData decode base64
//     NSData* zkeyBytes = [[NSData alloc]initWithBase64EncodedString:zkeyBytes1 options:0];
//     NSData* wtnsBytes = [[NSData alloc]initWithBase64EncodedString:wtnsBytes1 options:0];

//     const void *zkey_buffer = [zkeyBytes bytes];
//     unsigned long zkey_size = [zkeyBytes length];

//     const void *wtns_buffer = [wtnsBytes bytes];
//     unsigned long wtns_size = [wtnsBytes length];

//     unsigned long proof_size = (unsigned long) [proofBufferSize intValue];
//     char proof_buffer[proof_size];

//     unsigned long public_buffer_size = (unsigned long) [publicBufferSize intValue];
//     char public_buffer[public_buffer_size];

//     unsigned long error_msg_maxsize = (unsigned long) [errBufferSize intValue];
//     char error_msg[error_msg_maxsize];

//     int statusCode = groth16_prover(
//       zkey_buffer, zkey_size,
//       wtns_buffer, wtns_size,
//       proof_buffer, &proof_size,
//       public_buffer, &public_buffer_size,
//       error_msg, error_msg_maxsize
//     );

//     if (statusCode != PROVER_OK) {
//       NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
//       RCTLogError(@"Error:%@", errorString);
//       reject([NSString stringWithFormat:@"%d", statusCode], errorString, nil);
//       return;
//     }

//     NSString *proofResult = [NSString stringWithCString:proof_buffer encoding:NSUTF8StringEncoding];
//     NSString *publicResult = [NSString stringWithCString:public_buffer encoding:NSUTF8StringEncoding];

//     if (proofResult.length > 0) {
//       NSDictionary *resultDict = @{@"proof": proofResult, @"pub_signals": publicResult};
//       resolve(resultDict);
//     } else {
//       NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
//       RCTLogError(@"Error:%@", errorString);

//       reject([NSString stringWithFormat:@"%d", statusCode], errorString, nil);
//     }
// }

// RCT_EXPORT_METHOD(groth16ProveWithZKeyFilePath:(nonnull NSString *)zkey_file_path
//                   witnessData:(nonnull NSString *)wtnsBytes1
//                   proofBufferSize:(nonnull NSNumber *)proofBufferSize
//                   publicBufferSize:(nonnull NSNumber *)publicBufferSize
//                   errBufferSize:(nonnull NSNumber *)errBufferSize
//                   resolve:(RCTPromiseResolveBlock)resolve
//                   reject:(RCTPromiseRejectBlock)reject)
// {
//     const char *file_path = [zkey_file_path UTF8String];

//     NSData* wtnsBytes = [[NSData alloc]initWithBase64EncodedString:wtnsBytes1 options:0];

//     const void *wtns_buffer = [wtnsBytes bytes];
//     unsigned long wtns_size = [wtnsBytes length];

//     unsigned long proof_size = (unsigned long) [proofBufferSize intValue];
//     char proof_buffer[proof_size];

//     unsigned long public_buffer_size = (unsigned long) [publicBufferSize intValue];
//     char public_buffer[public_buffer_size];

//     unsigned long error_msg_maxsize = (unsigned long) [errBufferSize intValue];
//     char error_msg[error_msg_maxsize];

//     int statusCode = groth16_prover_zkey_file(
//       file_path,
//       wtns_buffer, wtns_size,
//       proof_buffer, &proof_size,
//       public_buffer, &public_buffer_size,
//       error_msg, error_msg_maxsize
//     );

//     if (statusCode != PROVER_OK) {
//       NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
//       RCTLogError(@"Error:%@", errorString);
//       reject([NSString stringWithFormat:@"%d", statusCode], errorString, nil);
//       return;
//     }

//     NSString *proofResult = [NSString stringWithCString:proof_buffer encoding:NSUTF8StringEncoding];
//     NSString *publicResult = [NSString stringWithCString:public_buffer encoding:NSUTF8StringEncoding];

//     if (proofResult.length > 0) {
//       NSDictionary *resultDict = @{@"proof": proofResult, @"pub_signals": publicResult};
//       resolve(resultDict);
//     } else {
//       NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
//       RCTLogInfo(@"Error:%@", errorString);

//       reject([NSString stringWithFormat:@"%d", statusCode], errorString, nil);
//     }
// }

// RCT_EXPORT_METHOD(groth16Verify:(nonnull NSString *)proof
//         inputs:(nonnull NSString *)inputs
//         verification_key:(nonnull NSString *)verification_key
//         errBufferSize:(nonnull NSNumber *)errBufferSize
//         resolve:(RCTPromiseResolveBlock)resolve
//         reject:(RCTPromiseRejectBlock)reject)
// {
//     // Convert NSString to C-style strings
//     const char *cProof = [proof UTF8String];
//     const char *cInputs = [inputs UTF8String];
//     const char *cVerificationKey = [verification_key UTF8String];

//     unsigned long error_msg_maxsize = (unsigned long) [errBufferSize intValue];
//     char error_msg[error_msg_maxsize];

//     // Call the Rust function
//     int result = groth16_verify(cProof, cInputs, cVerificationKey, error_msg, error_msg_maxsize);

//     if (result != VERIFIER_ERROR) {
//       bool proofValid = result == VERIFIER_VALID_PROOF;
//       resolve(@(proofValid));
//     } else {
//       NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
//       RCTLogError(@"Error:%@", errorString);
//       reject([NSString stringWithFormat:@"%d", result], errorString, nil);
//     }
// }

// RCT_EXPORT_METHOD(groth16PublicSizeForZkeyBuf:(nonnull NSString *)zkeyBytes1
//                   errBufferSize:(nonnull NSNumber *)errBufferSize
//                   resolve:(RCTPromiseResolveBlock)resolve
//                   reject:(RCTPromiseRejectBlock)reject)
// {
//     // NSData decode base64
//     NSData* zkeyBytes = [[NSData alloc]initWithBase64EncodedString:zkeyBytes1 options:0];

//     const void *zkey_buffer = [zkeyBytes bytes];
//     unsigned long zkey_size = [zkeyBytes length];

//     unsigned long error_msg_maxsize = (unsigned long) [errBufferSize intValue];
//     char error_msg[error_msg_maxsize];

//     size_t public_buffer_size = 0;

//     int status_code = groth16_public_size_for_zkey_buf(
//       zkey_buffer, zkey_size,
//       &public_buffer_size,
//       error_msg, error_msg_maxsize
//     );

//     if (status_code == PROVER_OK) {
//       resolve(@(public_buffer_size));
//     } else {
//       NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
//       RCTLogInfo(@"Error:%@", errorString);
//       reject([NSString stringWithFormat:@"%d", status_code], errorString, nil);
//     }
// }

// RCT_EXPORT_METHOD(groth16PublicSizeForZkeyFile:(nonnull NSString *)zkey_file_path
//                   errBufferSize:(nonnull NSNumber *)errBufferSize
//                   resolve:(RCTPromiseResolveBlock)resolve
//                   reject:(RCTPromiseRejectBlock)reject)
// {
//     const char *file_path = [zkey_file_path UTF8String];

//     unsigned long error_msg_maxsize = (unsigned long) [errBufferSize intValue];
//     char error_msg[error_msg_maxsize];

//     unsigned long public_buffer_size = 0;

//     int status_code = groth16_public_size_for_zkey_file(
//       file_path,
//       &public_buffer_size,
//       error_msg, error_msg_maxsize
//     );

//     if (status_code == PROVER_OK) {
//       resolve(@(public_buffer_size));
//     } else {
//       NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
//       RCTLogError(@"Error:%@", errorString);
//       reject([NSString stringWithFormat:@"%d", status_code], errorString, nil);
//     }
// }

// RCT_EXPORT_METHOD(groth16FullProve:(nonnull NSString *)zkey_file_path
//                   jsonData:(nonnull NSString *)jsonData
//                   proofBufferSize:(nonnull NSNumber *)proofBufferSize
//                   publicBufferSize:(nonnull NSNumber *)publicBufferSize
//                   resolve:(RCTPromiseResolveBlock)resolve
//                   reject:(RCTPromiseRejectBlock)reject)
// {
//     const char *file_path = [zkey_file_path UTF8String];

//     // Load circuit data from the aadhaar-verifier.dat file within the app bundle
//     NSString *circuitFilePath = [[NSBundle mainBundle] pathForResource:@"aadhaar_verifier" ofType:@"dat"];
//     NSData *circuitBytes = [NSData dataWithContentsOfFile:circuitFilePath];
//     if (!circuitBytes) {
//         NSString *errorString = @"Failed to load aadhaar-verifier.dat from bundle";
//         RCTLogError(@"%@", errorString);
//         reject(@"500", errorString, nil);
//         return;
//     }
//     const char *circuit_buffer = (const char *)[circuitBytes bytes];
//     unsigned long circuit_size = [circuitBytes length];

//     NSData* jsonBytes;
//     if ([jsonData isKindOfClass:[NSDictionary class]]) {
//         NSError *error;
//         jsonBytes = [NSJSONSerialization dataWithJSONObject:jsonData options:0 error:&error];
//         if (error) {
//             NSString *errorString = [NSString stringWithFormat:@"JSON serialization error: %@", error.localizedDescription];
//             RCTLogError(@"%@", errorString);
//             reject(@"500", errorString, nil);
//             return;
//         }
//     } else if ([jsonData isKindOfClass:[NSString class]]) {
//         jsonBytes = [(NSString *)jsonData dataUsingEncoding:NSUTF8StringEncoding];
//     } else {
//         NSString *errorString = @"Invalid jsonData type";
//         RCTLogError(@"%@", errorString);
//         reject(@"500", errorString, nil);
//         return;
//     }
    
//     const char *json_buffer = (const char *)[jsonBytes bytes];
//     unsigned long json_size = [jsonBytes length];

//     unsigned long error_msg_maxsize = 256;
//     char *error_msg = (char *)malloc(error_msg_maxsize); // Allocate error message buffer

//     // unsigned long wtns_size = 100 * 1024 * 1024; // 100 MB
//     // char *wtns_buffer = (char *)malloc(wtns_size); // Allocate wtns buffer

//     unsigned long proof_size = (unsigned long) [proofBufferSize intValue];
//     char *proof_buffer = (char *)malloc(proof_size); // Allocate proof buffer dynamically

//     unsigned long public_buffer_size = (unsigned long) [publicBufferSize intValue];
//     char *public_buffer = (char *)malloc(public_buffer_size); // Allocate public buffer dynamically

//     int witnessStatus = 0;
//     unsigned long wtns_size = 0;
//     char *wtns_buffer = NULL;
//     int sizeStatus = witnesscalc_aadhaar_verifier(
//         circuit_buffer, circuit_size,
//         json_buffer, json_size,
//         NULL, &wtns_size, // Pass NULL or address of wtns_size variable
//         error_msg, error_msg_maxsize
//     );
//     printf("witnessStatus: %d\n", witnessStatus);

//     if (sizeStatus == WITNESSCALC_ERROR_SHORT_BUFFER && wtns_size > 0) {
//         printf("We're here");
//         // Allocate wtns_buffer with the required size
//         wtns_buffer = (char *)malloc(wtns_size);
//         if (!wtns_buffer) {
//             NSString *errorString = @"Failed to allocate memory for wtns_buffer";
//             RCTLogError(@"%@", errorString);
//             reject(@"500", errorString, nil);
//             return;
//         }

//         // Actual call with allocated buffer
//         witnessStatus = witnesscalc_aadhaar_verifier(
//             circuit_buffer, circuit_size,
//             json_buffer, json_size,
//             wtns_buffer, &wtns_size,
//             error_msg, error_msg_maxsize
//         );
//     }

//     printf("witnessStatus: %d\n", witnessStatus);

//     int statusCode = groth16_prover_zkey_file(
//       file_path,
//       wtns_buffer, wtns_size,
//       proof_buffer, &proof_size,
//       public_buffer, &public_buffer_size,
//       error_msg, error_msg_maxsize
//     );

//      if (statusCode != PROVER_OK) {
//       NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
//       RCTLogError(@"Error:%@", errorString);
//       reject([NSString stringWithFormat:@"%d", statusCode], errorString, nil);
//       return;
//     }

//     NSString *proofResult = [NSString stringWithCString:proof_buffer encoding:NSUTF8StringEncoding];
//     NSString *publicResult = [NSString stringWithCString:public_buffer encoding:NSUTF8StringEncoding];

//     if (proofResult.length > 0) {
//       NSDictionary *resultDict = @{@"proof": proofResult, @"pub_signals": publicResult};
//       resolve(resultDict);
//     } else {
//       NSString *errorString = [NSString stringWithCString:error_msg encoding:NSUTF8StringEncoding];
//       RCTLogInfo(@"Error:%@", errorString);

//       reject([NSString stringWithFormat:@"%d", statusCode], errorString, nil);
//     }

//     // Remember to free the allocated memory to avoid memory leaks
//     free(wtns_buffer);
//     free(proof_buffer);
//     free(public_buffer);
//     free(error_msg);
// }

// @end
