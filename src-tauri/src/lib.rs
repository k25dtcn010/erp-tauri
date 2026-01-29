// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod anticheat;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_geolocation::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            anticheat::init_anticheat,
            anticheat::get_secure_location,
            anticheat::check_time_reliability,
            anticheat::check_root_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
