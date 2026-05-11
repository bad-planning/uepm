use crate::errors::UepmError;
use configparser::ini::Ini;
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Default, Clone)]
pub struct ProjectManifest {
    pub plugins: HashMap<String, String>,
    pub engine_version: Option<String>,
}

pub fn read_manifest(project_dir: &Path) -> Result<ProjectManifest, UepmError> {
    let path = project_dir.join("uepm.ini");
    let mut config = Ini::new();
    config
        .load(path.to_str().unwrap())
        .map_err(|e| UepmError::ManifestParse(e.to_string()))?;

    let plugins = config
        .get_map_ref()
        .get("plugins")
        .map(|section| {
            section
                .iter()
                .filter_map(|(k, v)| v.as_ref().map(|v| (k.clone(), v.trim().to_string())))
                .collect()
        })
        .unwrap_or_default();

    let engine_version = config.get("settings", "engine_version");

    Ok(ProjectManifest {
        plugins,
        engine_version,
    })
}

pub fn write_manifest(project_dir: &Path, manifest: &ProjectManifest) -> Result<(), UepmError> {
    let path = project_dir.join("uepm.ini");
    let mut config = Ini::new();

    for (name, range) in &manifest.plugins {
        config.set("plugins", name, Some(range.clone()));
    }

    if let Some(ref ev) = manifest.engine_version {
        config.set("settings", "engine_version", Some(ev.clone()));
    }

    config
        .write(path.to_str().unwrap())
        .map_err(|e| UepmError::ManifestParse(e.to_string()))?;
    Ok(())
}

pub fn create_manifest(project_dir: &Path, engine_version: Option<&str>) -> Result<(), UepmError> {
    let manifest = ProjectManifest {
        plugins: HashMap::new(),
        engine_version: engine_version.map(|s| s.to_string()),
    };
    write_manifest(project_dir, &manifest)
}

pub fn add_plugin(project_dir: &Path, package: &str, range: &str) -> Result<(), UepmError> {
    let mut manifest = read_manifest(project_dir)?;
    manifest.plugins.insert(package.to_string(), range.to_string());
    write_manifest(project_dir, &manifest)
}

pub fn remove_plugin(project_dir: &Path, package: &str) -> Result<(), UepmError> {
    let mut manifest = read_manifest(project_dir)?;
    manifest.plugins.remove(package);
    write_manifest(project_dir, &manifest)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    fn sample_ini() -> &'static str {
        "[plugins]\n@acme/cool-plugin = ^1.0.0\n@studio/other = ~2.1.0\n\n[settings]\nengine_version = 5.7\n"
    }

    #[test]
    fn test_parse_manifest() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("uepm.ini");
        fs::write(&path, sample_ini()).unwrap();
        let m = read_manifest(dir.path()).unwrap();
        assert_eq!(m.plugins.get("@acme/cool-plugin").map(|s| s.as_str()), Some("^1.0.0"));
        assert_eq!(m.plugins.get("@studio/other").map(|s| s.as_str()), Some("~2.1.0"));
        assert_eq!(m.engine_version.as_deref(), Some("5.7"));
    }

    #[test]
    fn test_write_manifest() {
        let dir = tempdir().unwrap();
        let mut m = ProjectManifest::default();
        m.plugins.insert("@foo/bar".to_string(), "^1.0.0".to_string());
        m.engine_version = Some("5.3".to_string());
        write_manifest(dir.path(), &m).unwrap();
        let content = fs::read_to_string(dir.path().join("uepm.ini")).unwrap();
        assert!(content.contains("@foo/bar"));
        assert!(content.contains("^1.0.0"));
        assert!(content.contains("engine_version"));
    }

    #[test]
    fn test_create_manifest() {
        let dir = tempdir().unwrap();
        create_manifest(dir.path(), Some("5.4")).unwrap();
        let m = read_manifest(dir.path()).unwrap();
        assert!(m.plugins.is_empty());
        assert_eq!(m.engine_version.as_deref(), Some("5.4"));
    }

    #[test]
    fn test_missing_manifest_returns_error() {
        let dir = tempdir().unwrap();
        assert!(read_manifest(dir.path()).is_err());
    }

    #[test]
    fn test_add_and_remove_plugin() {
        let dir = tempdir().unwrap();
        create_manifest(dir.path(), None).unwrap();
        add_plugin(dir.path(), "@acme/plugin", "^1.0.0").unwrap();
        let m = read_manifest(dir.path()).unwrap();
        assert!(m.plugins.contains_key("@acme/plugin"));
        remove_plugin(dir.path(), "@acme/plugin").unwrap();
        let m = read_manifest(dir.path()).unwrap();
        assert!(!m.plugins.contains_key("@acme/plugin"));
    }
}
