//
//  MoproCircomBridge.m
//  anon-aadhaar-react-native
//
//  Created by Yanis Meziane on 22/02/2024.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTLog.h>
#import "moproFFI.h"

@interface RCT_EXTERN_MODULE(MoproCircomBridge, NSObject)

RCT_EXTERN_METHOD(setup: (RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)
+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
