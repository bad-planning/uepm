use crate::errors::UepmError;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LockFile {
    pub version: u32,
    pub plugins: HashMap<String, LockedPlugin>,
}

impl Default for LockFile {
    fn default() -> Self {
        LockFile {
            version: 1,
            plugins: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LockedPlugin {
    pub resolved: String,
    pub tarball: String,
    pub sha512: String,
    pub dependencies: HashMap<String, String>,
}

pub fn read_lockfile(project_dir: &Path) -> Result<Option<LockFile>, UepmError> {
    let path = project_dir.join("uepm.lock");
    if !path.exists() {
        return Ok(None);
    }
    let content = std::fs::read_to_string(&path)?;
    let lock: LockFile = serde_json::from_str(&content)?;
    Ok(Some(lock))
}

pub fn write_lockfile(project_dir: &Path, lock: &LockFile) -> Result<(), UepmError> {
    let path = project_dir.join("uepm.lock");
    let content = serde_json::to_string_pretty(lock)?;
    std::fs::write(&path, content + "\n")?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn sample_lock() -> LockFile {
        let mut lock = LockFile::default();
        lock.plugins.insert(
            "@acme/cool-plugin".to_string(),
            LockedPlugin {
                resolved: "1.0.3".to_string(),
                tarball: "https://registry.npmjs.org/@acme/cool-plugin/-/cool-plugin-1.0.3.tgz".to_string(),
                sha512: "abc123".to_string(),
                dependencies: HashMap::new(),
            },
        );
        lock
    }

    #[test]
    fn test_roundtrip() {
        let dir = tempdir().unwrap();
        let lock = sample_lock();
        write_lockfile(dir.path(), &lock).unwrap();
        let loaded = read_lockfile(dir.path()).unwrap().unwrap();
        assert_eq!(loaded.version, 1);
        let plugin = loaded.plugins.get("@acme/cool-plugin").unwrap();
        assert_eq!(plugin.resolved, "1.0.3");
        assert_eq!(plugin.sha512, "abc123");
    }

    #[test]
    fn test_missing_lockfile_returns_none() {
        let dir = tempdir().unwrap();
        assert!(read_lockfile(dir.path()).unwrap().is_none());
    }

    #[test]
    fn test_default_version_is_1() {
        assert_eq!(LockFile::default().version, 1);
    }
}
