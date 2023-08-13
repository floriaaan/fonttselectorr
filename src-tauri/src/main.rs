// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::{self, Write};

#[tauri::command]
fn save_image(image: &str, save_folder: &str, text: &str) -> bool {
    // Split the data URL into its components
    let parts: Vec<&str> = image.split(",").collect();
    if parts.len() != 2 {
        return false;
    }

    let encoded_data = parts[1];

    // Decode the base64-encoded data
    let decoded_data =
        base64::decode(encoded_data).map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e));

    let seperator = std::path::MAIN_SEPARATOR;

    // file name is text_year_month_day.png
    let file_name = format!("{}_{}.png", text, chrono::Local::now().format("%Y_%m_%d"));
    let path = format!("{}{}{}", save_folder, seperator, file_name);

    let mut file = match File::create(path.clone().as_str()) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("Error creating file: {}", e);
            return false;
        }
    };
    if let Err(e) = file.write_all(&decoded_data.unwrap()) {
        eprintln!("Error writing to file: {}", e);
        return false;
    }
    return true;
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![save_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
