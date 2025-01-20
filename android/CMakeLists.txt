cmake_minimum_required(VERSION 3.22.1)
project(anon-aadhaar)

# Include directories for all headers
include_directories(
    src/main/cpp
)

# Add rapidsnark library
add_library(rapidsnark SHARED IMPORTED)
set_target_properties(rapidsnark PROPERTIES
    IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/src/main/libs/librapidsnark.so)

# Add witness calculator library
add_library(witnesscalc_aadhaar_verifier SHARED IMPORTED)
set_target_properties(witnesscalc_aadhaar_verifier PROPERTIES
    IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/src/main/libs/libwitnesscalc_aadhaar_verifier.so)

# Main library
add_library(anon-aadhaar-react-native SHARED
    src/main/cpp/cpp-adapter.cpp)

# Link all libraries
target_link_libraries(anon-aadhaar-react-native
    rapidsnark
    witnesscalc_aadhaar_verifier
    android
    log)