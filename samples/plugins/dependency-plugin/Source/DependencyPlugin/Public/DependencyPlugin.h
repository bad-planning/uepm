#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

class FDependencyPluginModule : public IModuleInterface
{
public:

    /** IModuleInterface implementation */
    virtual void StartupModule() override;
    virtual void ShutdownModule() override;

private:
    /** Demonstrates using functionality from ExamplePlugin */
    void UseExamplePluginFunctionality();
};