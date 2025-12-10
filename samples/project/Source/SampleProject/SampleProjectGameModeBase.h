#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "SampleProjectGameModeBase.generated.h"

/**
 * Sample Game Mode that demonstrates UEPM plugin integration
 */
UCLASS()
class SAMPLEPROJECT_API ASampleProjectGameModeBase : public AGameModeBase
{
	GENERATED_BODY()

public:
	ASampleProjectGameModeBase();

protected:
	virtual void BeginPlay() override;

private:
	// Demonstrate plugin integration by calling plugin functions
	void TestPluginIntegration();
};