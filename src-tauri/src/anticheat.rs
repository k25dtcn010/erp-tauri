use tauri::{command, AppHandle, Runtime};
use serde_json::Value;

#[cfg(target_os = "android")]
use jni::objects::JValue;

#[command]
pub fn init_anticheat<R: Runtime>(_app: AppHandle<R>) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        let ctx = ndk_context::android_context();
        let vm = unsafe { jni::JavaVM::from_raw(ctx.vm() as *mut _) }.map_err(|e| e.to_string())?;
        let mut env = vm.attach_current_thread().map_err(|e| e.to_string())?;
        
        let context_obj = unsafe { jni::objects::JObject::from_raw(ctx.context() as *mut _) };
        
        let cls = env.find_class("com/dell/timekeeping/anticheat/AntiCheatPlugin").map_err(|e| e.to_string())?;
        
        // getInstance
        let instance = env.call_static_method(
            cls, 
            "getInstance", 
            "(Landroid/content/Context;)Lcom/dell/timekeeping/anticheat/AntiCheatPlugin;", 
            &[JValue::Object(&context_obj)]
        ).map_err(|e| e.to_string())?;
        
        let instance_obj = instance.l().map_err(|e| e.to_string())?;
        
        // initialize
        env.call_method(&instance_obj, "initialize", "()V", &[]).map_err(|e| e.to_string())?;
        
        // startLocationUpdates
        env.call_method(&instance_obj, "startLocationUpdates", "()V", &[]).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[command]
pub fn get_secure_location<R: Runtime>(_app: AppHandle<R>) -> Result<Value, String> {
    #[cfg(target_os = "android")]
    {
        let val = call_json_method("getSecureLocationJson")?;
        return Ok(val);
    }
    #[cfg(not(target_os = "android"))]
    Ok(serde_json::json!({ "status": "simulated", "latitude": 0.0, "longitude": 0.0 }))
}

#[command]
pub fn check_time_reliability<R: Runtime>(_app: AppHandle<R>) -> Result<Value, String> {
    #[cfg(target_os = "android")]
    {
        let val = call_json_method("checkTimeReliabilityJson")?;
        return Ok(val);
    }
    #[cfg(not(target_os = "android"))]
    Ok(serde_json::json!({ "isCheatingTime": false, "reliabilityValue": 100 }))
}

#[command]
pub fn check_root_status<R: Runtime>(_app: AppHandle<R>) -> Result<Value, String> {
    #[cfg(target_os = "android")]
    {
        let val = call_json_method("checkRootStatusJson")?;
        return Ok(val);
    }
    #[cfg(not(target_os = "android"))]
    Ok(serde_json::json!({ "isRooted": false }))
}

#[cfg(target_os = "android")]
fn call_json_method(method_name: &str) -> Result<Value, String> {
    let ctx = ndk_context::android_context();
    let vm = unsafe { jni::JavaVM::from_raw(ctx.vm() as *mut _) }.map_err(|e| e.to_string())?;
    let mut env = vm.attach_current_thread().map_err(|e| e.to_string())?;

    let context_obj = unsafe { jni::objects::JObject::from_raw(ctx.context() as *mut _) };
    let cls = env.find_class("com/dell/timekeeping/anticheat/AntiCheatPlugin").map_err(|e| e.to_string())?;
    
    let instance = env.call_static_method(
        cls, 
        "getInstance", 
        "(Landroid/content/Context;)Lcom/dell/timekeeping/anticheat/AntiCheatPlugin;", 
        &[JValue::Object(&context_obj)]
    ).map_err(|e| e.to_string())?;
    
    let instance_obj = instance.l().map_err(|e| e.to_string())?;

    let json_jstr = env.call_method(instance_obj, method_name, "()Ljava/lang/String;", &[])
        .map_err(|e| e.to_string())?
        .l()
        .map_err(|e| e.to_string())?;
        
    let json_str: String = env.get_string(&json_jstr.into()).map_err(|e| e.to_string())?.into();
    
    let val: Value = serde_json::from_str(&json_str).unwrap_or(serde_json::json!({}));
    Ok(val)
}
