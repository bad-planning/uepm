#include "DependencyPlugin.h"
#include "ExamplePlugin.h"

#define LOCTEXT_NAMESPACE "FDependencyPluginModule"

void FDependencyPluginModule::StartupModule()
{
    // This code will execute after your module is loaded into memory; the exact timing is specified in the .uplugin file per-module
    UE_LOG(LogTemp, Warning, TEXT("DependencyPlugin module has been loaded"));
    
    // Demonstrate using functionality from ExamplePlugin
    UseExamplePluginFunctionality();
}

void FDependencyPluginModule::ShutdownModule()
{
    // This function may be called during shutdown to clean up your module.  For modules that support dynamic reloading,
    // we call this function before unloading the module.
    UE_LOG(LogTemp, Warning, TEXT("DependencyPlugin module has been unloaded"));
}

void FDependencyPluginModule::UseExamplePluginFunctionality()
{
    // Check if ExamplePlugin module is loaded
    if (FModuleManager::Get().IsModuleLoaded("ExamplePlugin"))
    {
        UE_LOG(LogTemp, Warning, TEXT("DependencyPlugin: ExamplePlugin is loaded and available"));
        
        // In a real implementation, you would call specific functions from ExamplePlugin
        // For this example, we just log that the dependency is available
        UE_LOG(LogTemp, Warning, TEXT("DependencyPlugin: Successfully using ExamplePlugin functionality"));
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("DependencyPlugin: ExamplePlugin is not loaded - dependency not satisfied"));
    }
}

#undef LOCTEXT_NAMESPACE

IMPLEMENT_MODULE(FDependencyPluginModule, DependencyPlugin)