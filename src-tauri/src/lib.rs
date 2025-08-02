use image_base64;

use base64::{engine::general_purpose, Engine as _};
use gif;
use image;
use std::error::Error;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_image_from_path(name: &str) -> String {
    let base64 = image_base64::to_base64(name);
    return base64;
}

#[tauri::command]
fn get_gif_from_image(image: &str) -> String {
    (|| -> Result<String, Box<dyn Error>> {
        let decoded_bytes = image_base64::from_base64(image.to_string());
        let loaded_image = image::load_from_memory(&decoded_bytes)?;
        let rgba_image = loaded_image.to_rgba8();
        let (width, height) = rgba_image.dimensions();

        let mut gif_data: Vec<u8> = Vec::new();
        {
            let mut encoder = gif::Encoder::new(&mut gif_data, width as u16, height as u16, &[])?;
            encoder.set_repeat(gif::Repeat::Infinite)?;

            let frame = gif::Frame::from_rgba_speed(
                width as u16,
                height as u16,
                &mut rgba_image.clone().into_raw(),
                10,
            );
            encoder.write_frame(&frame)?;
        }

        let gif_base64 = general_purpose::STANDARD.encode(&gif_data);

        Ok(format!("data:image/gif;base64,{}", gif_base64))
    })()
    .unwrap_or_else(|e| format!("ERROR: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_image_from_path,
            get_gif_from_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
