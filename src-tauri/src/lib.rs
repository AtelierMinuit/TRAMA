use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};
use tauri::Emitter;
use tauri_plugin_sql::{Migration, MigrationKind};

const MAX_FILE_BYTES: u64 = 50 * 1024 * 1024;

fn validated_path(raw: &str, write: bool) -> Result<PathBuf, String> {
    let path = PathBuf::from(raw);
    if !path.is_absolute() {
        return Err("TRAMA solo acepta rutas absolutas seleccionadas mediante un diálogo nativo.".to_string());
    }
    if path.components().any(|component| matches!(component, std::path::Component::ParentDir)) {
        return Err("La ruta contiene un segmento no permitido.".to_string());
    }
    let extension = path.extension().and_then(|value| value.to_str()).unwrap_or_default().to_ascii_lowercase();
    if write {
        if !matches!(extension.as_str(), "trama" | "svg" | "png" | "pdf") {
            return Err("TRAMA solo puede escribir archivos .trama, .svg, .png o .pdf.".to_string());
        }
        let parent = path.parent().ok_or_else(|| "La ruta no tiene carpeta de destino.".to_string())?;
        if !parent.is_dir() {
            return Err("La carpeta de destino no existe.".to_string());
        }
    } else {
        if extension != "trama" {
            return Err("TRAMA solo puede abrir archivos .trama desde el diálogo nativo.".to_string());
        }
        if !path.is_file() {
            return Err("El archivo seleccionado no existe.".to_string());
        }
    }
    Ok(path)
}

#[tauri::command]
fn read_file_bytes(path: String) -> Result<Vec<u8>, String> {
    let path = validated_path(&path, false)?;
    let metadata = fs::metadata(&path).map_err(|error| format!("No se pudo inspeccionar el archivo: {error}"))?;
    if metadata.len() > MAX_FILE_BYTES {
        return Err("El archivo supera el límite de 50 MiB.".to_string());
    }
    fs::read(path).map_err(|error| format!("No se pudo leer el archivo: {error}"))
}

#[tauri::command]
fn write_file_bytes(path: String, data: Vec<u8>) -> Result<(), String> {
    let path = validated_path(&path, true)?;
    if data.len() as u64 > MAX_FILE_BYTES {
        return Err("La exportación supera el límite de 50 MiB.".to_string());
    }
    let parent = path.parent().ok_or_else(|| "La ruta no tiene carpeta de destino.".to_string())?;
    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| "El reloj del sistema no es válido.".to_string())?
        .as_nanos();
    let temporary = parent.join(format!(".trama-write-{}-{nonce}.tmp", std::process::id()));
    fs::write(&temporary, data).map_err(|error| format!("No se pudo escribir el archivo temporal: {error}"))?;
    if let Err(error) = fs::rename(&temporary, &path) {
        let _ = fs::remove_file(&temporary);
        return Err(format!("No se pudo confirmar la escritura: {error}"));
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "initial_schema",
        sql: include_str!("../migrations/001_initial.sql"),
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:trama.db", migrations)
                .build(),
        )
        .menu(|app| {
            let new_item = MenuItemBuilder::with_id("new", "Nuevo ecomapa")
                .accelerator("CmdOrCtrl+N")
                .build(app)?;
            let open_item = MenuItemBuilder::with_id("open", "Abrir ecomapa…")
                .accelerator("CmdOrCtrl+O")
                .build(app)?;
            let save_item = MenuItemBuilder::with_id("save", "Guardar")
                .accelerator("CmdOrCtrl+S")
                .build(app)?;
            let save_as_item = MenuItemBuilder::with_id("save-as", "Guardar como .trama…")
                .accelerator("CmdOrCtrl+Shift+S")
                .build(app)?;
            let export_item = MenuItemBuilder::with_id("export", "Exportar…")
                .build(app)?;
            let close_item = MenuItemBuilder::with_id("close", "Cerrar ecomapa")
                .accelerator("CmdOrCtrl+W")
                .build(app)?;
            let undo_item = MenuItemBuilder::with_id("undo", "Deshacer")
                .accelerator("CmdOrCtrl+Z")
                .build(app)?;
            let redo_item = MenuItemBuilder::with_id("redo", "Rehacer")
                .accelerator("CmdOrCtrl+Shift+Z")
                .build(app)?;
            let settings_item = MenuItemBuilder::with_id("settings", "Privacidad y preferencias…")
                .build(app)?;
            let about_item = MenuItemBuilder::with_id("about", "Acerca de TRAMA")
                .build(app)?;
            let separator_file = PredefinedMenuItem::separator(app)?;
            let separator_app = PredefinedMenuItem::separator(app)?;

            let app_menu = SubmenuBuilder::new(app, "TRAMA")
                .items(&[&about_item, &separator_app, &settings_item])
                .build()?;
            let file_menu = SubmenuBuilder::new(app, "Archivo")
                .items(&[&new_item, &open_item, &separator_file, &save_item, &save_as_item, &export_item, &close_item])
                .build()?;
            let edit_menu = SubmenuBuilder::new(app, "Edición")
                .items(&[&undo_item, &redo_item])
                .build()?;
            MenuBuilder::new(app)
                .items(&[&app_menu, &file_menu, &edit_menu])
                .build()
        })
        .on_menu_event(|app, event| {
            let action = match event.id().as_ref() {
                "new" => "new",
                "open" => "open",
                "save" => "save",
                "save-as" => "save-as",
                "export" => "export",
                "close" => "close",
                "undo" => "undo",
                "redo" => "redo",
                "settings" => "settings",
                "about" => "about",
                _ => return,
            };
            let _ = app.emit("trama://menu", action);
        })
        .invoke_handler(tauri::generate_handler![read_file_bytes, write_file_bytes])
        .run(tauri::generate_context!())
        .expect("error while running TRAMA");
}
