#include <jni.h>
#include "anon-aadhaar-react-native.h"
#include "prover.h"
#include "verifier.h"
#include "witnesscalc_aadhaar_verifier.h"


extern "C"
JNIEXPORT jdouble JNICALL
Java_com_anonaadhaar_reactnative_ReactNativeModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return anonaadhaar_reactnative::multiply(a, b);
}


// Witness Generation Function
extern "C"
JNIEXPORT jint JNICALL
Java_com_anonaadhaar_reactnative_ReactNativeModule_witnesscalc_1aadhaar_1verifier(JNIEnv *env, jobject thiz,
                                                              jbyteArray circuit_buffer,
                                                              jlong circuit_size,
                                                              jbyteArray json_buffer,
                                                              jlong json_size,
                                                              jbyteArray wtns_buffer,
                                                              jlongArray wtns_size,
                                                              jbyteArray error_msg,
                                                              jlong error_msg_max_size) {
    const char *circuitBuffer = reinterpret_cast<const char *>(env->GetByteArrayElements(
            circuit_buffer, nullptr));
    const char *jsonBuffer = reinterpret_cast<const char *>(env->GetByteArrayElements(json_buffer,
                                                                                      nullptr));
    char *wtnsBuffer = reinterpret_cast<char *>(env->GetByteArrayElements(wtns_buffer, nullptr));
    char *errorMsg = reinterpret_cast<char *>(env->GetByteArrayElements(error_msg, nullptr));

    unsigned long wtnsSize = env->GetLongArrayElements(wtns_size, nullptr)[0];


    int result = witnesscalc_aadhaar_verifier(
            circuitBuffer, static_cast<unsigned long>(circuit_size),
            jsonBuffer, static_cast<unsigned long>(json_size),
            wtnsBuffer, &wtnsSize,
            errorMsg, static_cast<unsigned long>(error_msg_max_size));

    // Set the result and release the resources
    env->SetLongArrayRegion(wtns_size, 0, 1, reinterpret_cast<jlong *>(&wtnsSize));

    env->ReleaseByteArrayElements(circuit_buffer,
                                  reinterpret_cast<jbyte *>(const_cast<char *>(circuitBuffer)), 0);
    env->ReleaseByteArrayElements(json_buffer,
                                  reinterpret_cast<jbyte *>(const_cast<char *>(jsonBuffer)), 0);
    env->ReleaseByteArrayElements(wtns_buffer, reinterpret_cast<jbyte *>(wtnsBuffer), 0);
    env->ReleaseByteArrayElements(error_msg, reinterpret_cast<jbyte *>(errorMsg), 0);

    return result;
}

// Proof Generation Function
extern "C" JNIEXPORT jint JNICALL
Java_com_anonaadhaar_reactnative_ReactNativeModule_groth16_1prover(
    JNIEnv *env, jobject thiz,
    jbyteArray zkey_buffer, jlong zkey_size,
    jbyteArray wtns_buffer, jlong wtns_size,
    jbyteArray proof_buffer, jlongArray proof_size,
    jbyteArray public_buffer, jlongArray public_size,
    jbyteArray error_msg, jlong error_msg_max_size)
{
    const void *zkeyBuffer = env->GetByteArrayElements(zkey_buffer, nullptr);
    const void *wtnsBuffer = env->GetByteArrayElements(wtns_buffer, nullptr);
    char *proofBuffer = reinterpret_cast<char *>(env->GetByteArrayElements(proof_buffer, nullptr));
    char *publicBuffer = reinterpret_cast<char *>(env->GetByteArrayElements(public_buffer, nullptr));
    char *errorMsg = reinterpret_cast<char *>(env->GetByteArrayElements(error_msg, nullptr));

    unsigned long proofSize = env->GetLongArrayElements(proof_size, nullptr)[0];
    unsigned long publicSize = env->GetLongArrayElements(public_size, nullptr)[0];

    int result = groth16_prover(
        zkeyBuffer, static_cast<unsigned long>(zkey_size),
        wtnsBuffer, static_cast<unsigned long>(wtns_size),
        proofBuffer, &proofSize,
        publicBuffer, &publicSize,
        errorMsg, static_cast<unsigned long>(error_msg_max_size));

    // Update sizes
    env->SetLongArrayRegion(proof_size, 0, 1, reinterpret_cast<const jlong *>(&proofSize));
    env->SetLongArrayRegion(public_size, 0, 1, reinterpret_cast<const jlong *>(&publicSize));

    // Release resources
    env->ReleaseByteArrayElements(zkey_buffer,
        reinterpret_cast<jbyte *>(const_cast<void *>(zkeyBuffer)), 0);
    env->ReleaseByteArrayElements(wtns_buffer,
        reinterpret_cast<jbyte *>(const_cast<void *>(wtnsBuffer)), 0);
    env->ReleaseByteArrayElements(proof_buffer, reinterpret_cast<jbyte *>(proofBuffer), 0);
    env->ReleaseByteArrayElements(public_buffer, reinterpret_cast<jbyte *>(publicBuffer), 0);
    env->ReleaseByteArrayElements(error_msg, reinterpret_cast<jbyte *>(errorMsg), 0);

    return result;
}

// Proof Generation Function with Zkeypath file
extern "C"
JNIEXPORT jint JNICALL
Java_com_anonaadhaar_reactnative_ReactNativeModule_groth16ProveWithZKeyFilePath(JNIEnv *env, jobject obj,
                                                                jstring zkeyPath,
                                                                jbyteArray wtnsBuffer, jlong wtnsSize,
                                                                jbyteArray proofBuffer, jlongArray proofSize,
                                                                jbyteArray publicBuffer, jlongArray publicSize,
                                                                jbyteArray errorMsg, jlong errorMsgMaxSize) {

    // Convert jbyteArray to native types
    const char *nativeZkeyPath = env->GetStringUTFChars(zkeyPath, nullptr);

    void *nativeWtnsBuffer = env->GetByteArrayElements(wtnsBuffer, nullptr);

    char *nativeProofBuffer = (char *) env->GetByteArrayElements(proofBuffer, nullptr);
    char *nativePublicBuffer = (char *) env->GetByteArrayElements(publicBuffer, nullptr);
    char *nativeErrorMsg = (char *) env->GetByteArrayElements(errorMsg, nullptr);

    jlong *nativeProofSizeArr = env->GetLongArrayElements(proofSize, 0);
    jlong *nativePublicSizeArr = env->GetLongArrayElements(publicSize, 0);

    unsigned long nativeProofSize = nativeProofSizeArr[0];
    unsigned long nativePublicSize = nativePublicSizeArr[0];

    // Call the groth16_prover function`
    int status_code = groth16_prover_zkey_file(
            nativeZkeyPath,
            nativeWtnsBuffer, wtnsSize,
            nativeProofBuffer, &nativeProofSize,
            nativePublicBuffer, &nativePublicSize,
            nativeErrorMsg, errorMsgMaxSize
    );

    // Convert the results back to JNI types
    nativeProofSizeArr[0] = nativeProofSize;
    nativePublicSizeArr[0] = nativePublicSize;

    env->SetLongArrayRegion(proofSize, 0, 1, (jlong *) nativeProofSizeArr);
    env->SetLongArrayRegion(publicSize, 0, 1, (jlong *) nativePublicSizeArr);

    // Release the native buffers
    env->ReleaseByteArrayElements(wtnsBuffer, (jbyte *) nativeWtnsBuffer, 0);
    env->ReleaseByteArrayElements(proofBuffer, (jbyte *) nativeProofBuffer, 0);
    env->ReleaseByteArrayElements(publicBuffer, (jbyte *) nativePublicBuffer, 0);
    env->ReleaseByteArrayElements(errorMsg, (jbyte *) nativeErrorMsg, 0);

    env->ReleaseLongArrayElements(proofSize, (jlong *) nativeProofSizeArr, 0);
    env->ReleaseLongArrayElements(publicSize, (jlong *) nativePublicSizeArr, 0);

    return status_code;
}

extern "C"
JNIEXPORT jint JNICALL
Java_com_anonaadhaar_reactnative_ReactNativeModule_groth16Verify(
    JNIEnv *env, jobject obj,
    jstring proof, jstring inputs, jstring verificationKey,
    jbyteArray errorMsg, jlong errorMsgMaxSize
) {
    
    const char *nativeInputs = env->GetStringUTFChars(inputs, nullptr);
    const char *nativeProof = env->GetStringUTFChars(proof, nullptr);
    const char *nativeVerificationKey = env->GetStringUTFChars(verificationKey, nullptr);
    char *nativeErrorMsg = (char *) env->GetByteArrayElements(errorMsg, nullptr);

    int status_code = groth16_verify(
        nativeProof,
        nativeInputs,
        nativeVerificationKey,
        nativeErrorMsg, errorMsgMaxSize
    );

    env->ReleaseStringUTFChars(inputs, nativeInputs);
    env->ReleaseStringUTFChars(proof, nativeProof);
    env->ReleaseStringUTFChars(verificationKey, nativeVerificationKey);
    env->ReleaseByteArrayElements(errorMsg, (jbyte *) nativeErrorMsg, 0);

    return status_code;
}