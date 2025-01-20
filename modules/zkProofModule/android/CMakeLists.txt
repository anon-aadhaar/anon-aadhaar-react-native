cmake_minimum_required(VERSION 3.4.1)
project(ReactNative)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 14)


# Specifies a path to native header files.
include_directories(
            ../cpp
)

# Add rapidsnark library
add_library(rapidsnark SHARED IMPORTED)
set_target_properties(rapidsnark PROPERTIES
    IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/libs/librapidsnark.so)

# Add witness calculator library
add_library(witnesscalc_aadhaar_verifier SHARED IMPORTED)
set_target_properties(witnesscalc_aadhaar_verifier PROPERTIES
    IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/libs/libwitnesscalc_aadhaar_verifier.so)

# Main library
add_library(anon-aadhaar-react-native 
    SHARED
    ../cpp/anon-aadhaar-react-native.cpp
    cpp-adapter.cpp
)