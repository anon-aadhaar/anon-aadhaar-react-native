cmake_minimum_required(VERSION 3.4.1)
project(anon-aadhaar)

add_library(anon-aadhaar-react-native SHARED
    src/main/cpp/anon-aadhaar-react-native.cpp
    src/main/cpp/cpp-adapter.cpp
    )