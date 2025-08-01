// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use image_base64;
// remember to call `.manage(MyState::default())`
#[tauri::command]
fn get_image_from_path(name: &str) -> String {
    let base64 = image_base64::to_base64(name);
    return base64;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![get_image_from_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
