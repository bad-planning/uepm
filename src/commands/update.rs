use crate::context::UEPMContext;
use crate::errors::UepmError;
use crate::lockfile::{write_lockfile, LockFile};
use crate::manifest::read_manifest;
use crate::resolver::{resolve_and_install, ResolveContext};
use std::collections::HashMap;

/// Re-resolve and reinstall plugins, ignoring the lockfile so fresh versions are fetched.
/// If `package` is `Some`, updates only that plugin; otherwise updates all.
pub async fn run(ctx: &UEPMContext, package: Option<String>) -> Result<(), UepmError> {
    let mut manifest = read_manifest(&ctx.project_dir)?;
    let mut lock = LockFile::default();
    let mut resolved: HashMap<String, String> = HashMap::new();
    let mut rctx = ResolveContext::new(ctx, &mut lock, &mut resolved);

    if let Some(pkg) = package {
        if let Some(range) = manifest.plugins.remove(&pkg) {
            resolve_and_install(&pkg, &range, &mut rctx).await?;
        }
    } else {
        for (pkg, range) in &manifest.plugins {
            resolve_and_install(pkg, range, &mut rctx).await?;
        }
    }

    write_lockfile(&ctx.project_dir, &lock)?;
    crate::output::print_success(&format!("Updated {} plugin(s)", resolved.len()));
    Ok(())
}
