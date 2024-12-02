#include <jni.h>
#include "anon-aadhaar-react-native.h"

extern "C"
JNIEXPORT jdouble JNICALL
Java_com_awesomelibrary_AwesomeLibraryModule_nativeAdd(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return anonaadhaar_reactnative::add(a, b);
}
