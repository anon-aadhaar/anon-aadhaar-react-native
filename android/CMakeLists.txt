cmake_minimum_required(VERSION 3.4.1)
project(anon-aadhaar)

# Include directories for headers
include_directories(
    cpp
    cpp/include
)

# Add the imported shared library
add_library(witnesscalc_aadhaar_verifier SHARED IMPORTED)
set_target_properties(witnesscalc_aadhaar_verifier PROPERTIES
    IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/src/main/libs/libwitnesscalc_aadhaar_verifier.so)

# Add your main library
add_library(anon-aadhaar-react-native SHARED
    src/main/cpp/anon-aadhaar-react-native.cpp
    src/main/cpp/cpp-adapter.cpp)

# Link the libraries
target_link_libraries(anon-aadhaar-react-native
    witnesscalc_aadhaar_verifier
    android
    log)