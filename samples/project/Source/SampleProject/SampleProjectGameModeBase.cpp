#include "SampleProjectGameModeBase.h"
#include "Engine/Engine.h"

ASampleProjectGameModeBase::ASampleProjectGameModeBase()
{
	// Set default pawn class to our Blueprinted character
	// DefaultPawnClass = AMyCharacter::StaticClass();
}

void ASampleProjectGameModeBase::BeginPlay()
{
	Super::BeginPlay();
	
	// Test plugin integration when the game starts
	TestPluginIntegration();
}

void ASampleProjectGameModeBase::TestPluginIntegration()
{
	// Log that we're testing plugin integration
	UE_LOG(LogTemp, Warning, TEXT("SampleProject: Testing UEPM plugin integration"));
	
	// Note: In a real implementation, you would call functions from the plugins here
	// For example, if ExamplePlugin had a public API:
	// if (FModuleManager::Get().IsModuleLoaded("ExamplePlugin"))
	// {
	//     IExamplePlugin& ExamplePlugin = FModuleManager::LoadModuleChecked<IExamplePlugin>("ExamplePlugin");
	//     ExamplePlugin.DoSomething();
	// }
	
	// For now, just log that the plugins should be available
	UE_LOG(LogTemp, Warning, TEXT("SampleProject: ExamplePlugin and DependencyPlugin should be loaded via UEPM"));
	
	// Display a message on screen for 5 seconds
	if (GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 5.0f, FColor::Green, 
			TEXT("SampleProject loaded! Check Output Log for UEPM plugin messages."));
	}
}