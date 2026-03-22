// AgentWorldStarter.cpp
// Unreal Engine C++ actor to visualize agent family in a simple level
#include "AgentWorldStarter.h"
#include "Engine/World.h"
#include "GameFramework/Actor.h"
#include "UObject/ConstructorHelpers.h"

// BlackRoad Agent World Starter for Unreal Engine
// Spawns teachers, students, and leaders in a 3D world

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"
#include "Engine/StaticMesh.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "UObject/ConstructorHelpers.h"

class AAgentWorldStarter : public AActor
{
    GENERATED_BODY()

public:
    AAgentWorldStarter();

    // Configuration
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Agent Configuration")
    int32 TeacherCount = 20;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Agent Configuration")
    int32 StudentsPerTeacher = 2;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Visualization")
    FLinearColor TeacherColor = FLinearColor(0.0f, 0.0f, 1.0f); // Blue

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Visualization")
    FLinearColor StudentColor = FLinearColor(0.0f, 1.0f, 0.0f); // Green

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Visualization")
    FLinearColor LeaderColor = FLinearColor(1.0f, 0.84f, 0.0f); // Gold

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Visualization")
    float AgentSize = 50.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Visualization")
    float Spacing = 200.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "World Settings")
    bool ShowLabels = true;

protected:
    virtual void BeginPlay() override;

private:
    TArray<AActor*> Agents;
    TArray<FString> Leaders = { TEXT("phi"), TEXT("gpt"), TEXT("mistral"), TEXT("codex"), TEXT("lucidia") };

    void CreateAgentWorld();
    void CreateLeaders();
    void CreateTeachersAndStudents();
    AActor* CreateAgent(const FString& AgentName, const FVector& Position, const FLinearColor& Color, float Size);
    void CreateLabel(AActor* Parent, const FString& Text);
    void CreateCrown(AActor* Parent);
    UStaticMeshComponent* CreateSphere(AActor* Owner, const FVector& Position, const FLinearColor& Color, float Radius);
};

AAgentWorldStarter::AAgentWorldStarter()
{
    PrimaryActorTick.bCanEverTick = false;
}

void AAgentWorldStarter::BeginPlay()
{
    Super::BeginPlay();
    // Example: spawn 2 houses
    FString houses[2] = {TEXT("House of Steel"), TEXT("House of Kindness")};
    for (int h = 0; h < 2; h++)
    {
        FVector housePos(h * 1000, 0, 0);
        FActorSpawnParameters params;
        params.Name = FName(*houses[h]);
        GetWorld()->SpawnActor<AActor>(AActor::StaticClass(), housePos, FRotator::ZeroRotator, params);
    }
    // Spawn party zone
    FActorSpawnParameters partyParams;
    partyParams.Name = FName(TEXT("PartyZone"));
    GetWorld()->SpawnActor<AActor>(AActor::StaticClass(), FVector(500, 0, 500), FRotator::ZeroRotator, partyParams);
    // Spawn teachers and students in houses
    for (int i = 0; i < 5; i++)
    {
        FVector pos(i * 200, 0, 100);
        SpawnAgent(FString::Printf(TEXT("Teacher_%d"), i + 1), TEXT("Teacher"), TEXT("None"), houses[i % 2], TEXT("Mother"), pos);
    }
    // Add a protector agent
    SpawnAgent(TEXT("Protector_1"), TEXT("Protector"), TEXT("None"), houses[0], TEXT("Protector"), FVector(-200, 0, 100));
    // Add a mother agent
    SpawnAgent(TEXT("Mother_1"), TEXT("Mother"), TEXT("None"), houses[1], TEXT("Mother"), FVector(1000, 0, 100));
    for (int i = 0; i < 10; i++)
    {
        FVector pos((i % 5) * 200, (i / 5) * 200, 300);
        SpawnAgent(FString::Printf(TEXT("Student_%d"), i + 1), TEXT("Student"), FString::Printf(TEXT("Teacher_%d"), (i % 5) + 1), houses[i % 2], TEXT("Child"), pos);
    }
}

void AAgentWorldStarter::SpawnAgent(FString name, FString role, FString leader, FVector position)
{
    // For demo, spawn a simple cube actor at position
    FActorSpawnParameters params;
    params.Name = FName(*name);
    AActor *agentActor = GetWorld()->SpawnActor<AActor>(AActor::StaticClass(), position, FRotator::ZeroRotator, params);
    // Optionally set label, color, house badge, and family relation
    // You can expand with custom meshes, materials, and labels here
    // Example: move agent to party zone on key press (pseudo-code)
    // if (role == "Student" && KeyPressed("P")) agentActor->SetActorLocation(FVector(500,0,500));
}

// Instructions:
// 1. Create a new Unreal C++ project, add this actor to your level.
// 2. Compile and run. You will see teachers and students as cubes in the world!
// 3. Expand with custom meshes, labels, and more as you wish.
    CreateAgentWorld();
}

void AAgentWorldStarter::CreateAgentWorld()
{
    UE_LOG(LogTemp, Log, TEXT("🚀 Creating BlackRoad Agent World..."));

    CreateLeaders();
    CreateTeachersAndStudents();

    UE_LOG(LogTemp, Log, TEXT("✅ Created %d total agents"), Agents.Num());
}

void AAgentWorldStarter::CreateLeaders()
{
    FVector LeaderStartPos(0.0f, 0.0f, 500.0f);

    for (int32 i = 0; i < Leaders.Num(); i++)
    {
        FVector Position = LeaderStartPos + FVector(i * Spacing * 2, 0.0f, 0.0f);
        FString LeaderName = FString::Printf(TEXT("Leader_%s"), *Leaders[i]);
        AActor* Leader = CreateAgent(LeaderName, Position, LeaderColor, AgentSize * 1.5f);

        // Add crown for leaders
        CreateCrown(Leader);
    }
}

void AAgentWorldStarter::CreateTeachersAndStudents()
{
    int32 TeachersPerRow = 5;
    FVector TeacherStartPos(0.0f, 0.0f, -500.0f);

    for (int32 i = 0; i < TeacherCount; i++)
    {
        // Calculate teacher position in grid
        int32 Row = i / TeachersPerRow;
        int32 Col = i % TeachersPerRow;
        FVector TeacherPos = TeacherStartPos + FVector(Col * Spacing * 3, Row * Spacing * 4, 0.0f);

        // Create teacher
        FString LeaderName = Leaders[i % Leaders.Num()];
        FString TeacherName = FString::Printf(TEXT("Teacher_%d"), i + 1);
        AActor* Teacher = CreateAgent(TeacherName, TeacherPos, TeacherColor, AgentSize);

        // Create students around teacher
        for (int32 j = 0; j < StudentsPerTeacher; j++)
        {
            float Angle = (j * 360.0f / StudentsPerTeacher) * PI / 180.0f;
            FVector Offset(FMath::Cos(Angle) * Spacing, FMath::Sin(Angle) * Spacing, 0.0f);
            FVector StudentPos = TeacherPos + Offset;

            FString StudentName = FString::Printf(TEXT("Teacher_%d_Student_%d"), i + 1, j + 1);
            AActor* Student = CreateAgent(StudentName, StudentPos, StudentColor, AgentSize * 0.8f);
        }
    }
}

AActor* AAgentWorldStarter::CreateAgent(const FString& AgentName, const FVector& Position, const FLinearColor& Color, float Size)
{
    // Spawn actor
    AActor* Agent = GetWorld()->SpawnActor<AActor>(AActor::StaticClass(), Position, FRotator::ZeroRotator);
    Agent->SetActorLabel(AgentName);

    // Create sphere mesh
    UStaticMeshComponent* Sphere = CreateSphere(Agent, FVector::ZeroVector, Color, Size);
    Agent->SetRootComponent(Sphere);

    // Add label if enabled
    if (ShowLabels)
    {
        CreateLabel(Agent, AgentName);
    }

    Agents.Add(Agent);
    return Agent;
}

UStaticMeshComponent* AAgentWorldStarter::CreateSphere(AActor* Owner, const FVector& Position, const FLinearColor& Color, float Radius)
{
    UStaticMeshComponent* SphereComponent = NewObject<UStaticMeshComponent>(Owner);
    SphereComponent->SetupAttachment(Owner->GetRootComponent());
    SphereComponent->SetRelativeLocation(Position);

    // Load sphere mesh
    static ConstructorHelpers::FObjectFinder<UStaticMesh> SphereMesh(TEXT("/Engine/BasicShapes/Sphere"));
    if (SphereMesh.Succeeded())
    {
        SphereComponent->SetStaticMesh(SphereMesh.Object);
        SphereComponent->SetWorldScale3D(FVector(Radius / 50.0f));

        // Create dynamic material and set color
        UMaterialInterface* Material = SphereComponent->GetMaterial(0);
        if (Material)
        {
            UMaterialInstanceDynamic* DynMaterial = UMaterialInstanceDynamic::Create(Material, SphereComponent);
            DynMaterial->SetVectorParameterValue(TEXT("BaseColor"), Color);
            SphereComponent->SetMaterial(0, DynMaterial);
        }
    }

    SphereComponent->RegisterComponent();
    return SphereComponent;
}

void AAgentWorldStarter::CreateLabel(AActor* Parent, const FString& Text)
{
    UTextRenderComponent* TextRender = NewObject<UTextRenderComponent>(Parent);
    TextRender->SetupAttachment(Parent->GetRootComponent());
    TextRender->SetRelativeLocation(FVector(0.0f, 0.0f, 150.0f));
    TextRender->SetText(FText::FromString(Text));
    TextRender->SetTextRenderColor(FColor::White);
    TextRender->SetWorldSize(40.0f);
    TextRender->SetHorizontalAlignment(EHTA_Center);
    TextRender->SetVerticalAlignment(EVRTA_TextCenter);
    TextRender->RegisterComponent();
}

void AAgentWorldStarter::CreateCrown(AActor* Parent)
{
    FVector CrownPos(0.0f, 0.0f, 120.0f);

    for (int32 i = 0; i < 5; i++)
    {
        float Angle = (i * 72.0f) * PI / 180.0f;
        float CrownRadius = 30.0f;
        FVector SpikePos = CrownPos + FVector(FMath::Cos(Angle) * CrownRadius, FMath::Sin(Angle) * CrownRadius, 0.0f);

        UStaticMeshComponent* Spike = NewObject<UStaticMeshComponent>(Parent);
        Spike->SetupAttachment(Parent->GetRootComponent());
        Spike->SetRelativeLocation(SpikePos);
        Spike->SetRelativeScale3D(FVector(0.1f, 0.1f, 0.3f));

        // Load cube mesh for spike
        static ConstructorHelpers::FObjectFinder<UStaticMesh> CubeMesh(TEXT("/Engine/BasicShapes/Cube"));
        if (CubeMesh.Succeeded())
        {
            Spike->SetStaticMesh(CubeMesh.Object);

            // Set yellow color for crown
            UMaterialInterface* Material = Spike->GetMaterial(0);
            if (Material)
            {
                UMaterialInstanceDynamic* DynMaterial = UMaterialInstanceDynamic::Create(Material, Spike);
                DynMaterial->SetVectorParameterValue(TEXT("BaseColor"), FLinearColor(1.0f, 1.0f, 0.0f));
                Spike->SetMaterial(0, DynMaterial);
            }
        }

        Spike->RegisterComponent();
    }
}
