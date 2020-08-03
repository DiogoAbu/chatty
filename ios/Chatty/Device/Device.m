#import "Device.h"

@implementation Device

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getDeviceName:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
  @try{
    UIDevice *currentDevice = [UIDevice currentDevice];
    resolve(currentDevice.name);
  }
  @catch(NSException *exception){
    resolve(nil);
  }
}

@end
