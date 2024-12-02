package com.awesomelibrary

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class AwesomeLibraryModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = NAME

  @ReactMethod
  fun multiply(a: Double, b: Double, promise: Promise) {
    promise.resolve(a * b)
  }

  @ReactMethod
  fun add(a: Double, b: Double, promise: Promise) {
    try {
      val result = nativeAdd(a, b)
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  companion object {
    const val NAME = "AwesomeLibrary"
    init {
      System.loadLibrary("anon-aadhaar-react-native")
    }
    @JvmStatic
    external fun nativeAdd(a: Double, b: Double): Double
  }
}