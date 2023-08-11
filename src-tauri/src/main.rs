// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::{self, Write};

#[tauri::command]
fn save_image(image: &str) -> bool {
    // Split the data URL into its components
    let parts: Vec<&str> = image.split(",").collect();
    if parts.len() != 2 {
        return false;
    }

    let encoded_data = parts[1];

    // Decode the base64-encoded data
    let decoded_data =
        base64::decode(encoded_data).map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e));

    // Create and write the decoded data to the specified file path
    let mut file = match File::create(
        // current_dir().unwrap().join("image.png")
        "image.png"
    ) {
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

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![save_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
