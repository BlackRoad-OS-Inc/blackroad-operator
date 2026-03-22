// AgentWorldStarter.cs
// Unity C# script to visualize agent family in a simple scene
using UnityEngine;
using System.Collections.Generic;

public class AgentWorldStarter : MonoBehaviour
{
    [System.Serializable]
    public class Agent
    {
        public string name;
        public string role;
        public string leader;
        public string house;
        public Vector3 position;
        public Color avatarColor;
        public string avatarShape; // "Cube", "Sphere", etc.
        public string familyRelation; // e.g. "Mother", "Protector", "Inventor"
    }

    public GameObject teacherPrefab;
    public GameObject studentPrefab;
    public GameObject protectorPrefab;
    public GameObject motherPrefab;
    public GameObject housePrefab;
    public GameObject partyZonePrefab;
    public List<Agent> agents = new List<Agent>();

    void Start()
    {
        // Example: spawn 2 houses
        string[] houses = { "House of Steel", "House of Kindness" };
        for (int h = 0; h < houses.Length; h++)
        {
            Vector3 housePos = new Vector3(h * 10, 0, -5);
            GameObject houseObj = Instantiate(housePrefab, housePos, Quaternion.identity);
            houseObj.name = houses[h];
        }
        // Spawn party zone
        GameObject partyZone = Instantiate(partyZonePrefab, new Vector3(5, 0, 10), Quaternion.identity);
        partyZone.name = "PartyZone";
        // Spawn teachers and students in houses
        for (int i = 0; i < 5; i++)
        {
            Agent teacher = new Agent {
                name = $"Teacher_{i+1}",
                role = "Teacher",
                leader = "None",
                house = houses[i%houses.Length],
                position = new Vector3(i * 2, 0, 0),
                avatarColor = Color.blue,
                avatarShape = "Cube",
                familyRelation = "Mother"
            };
            agents.Add(teacher);
            SpawnAgent(teacher, teacherPrefab);
        }
        // Add a protector agent
        Agent protector = new Agent {
            name = "Protector_1",
            role = "Protector",
            leader = "None",
            house = houses[0],
            position = new Vector3(-2, 0, 0),
            avatarColor = Color.red,
            avatarShape = "Sphere",
            familyRelation = "Protector"
        };
        agents.Add(protector);
        SpawnAgent(protector, protectorPrefab);
        // Add a mother agent
        Agent mother = new Agent {
            name = "Mother_1",
            role = "Mother",
            leader = "None",
            house = houses[1],
            position = new Vector3(12, 0, 0),
            avatarColor = Color.magenta,
            avatarShape = "Sphere",
            familyRelation = "Mother"
        };
        agents.Add(mother);
        SpawnAgent(mother, motherPrefab);
        for (int i = 0; i < 10; i++)
        {
            Agent student = new Agent {
                name = $"Student_{i+1}",
                role = "Student",
                leader = $"Teacher_{(i%5)+1}",
                house = houses[i%houses.Length],
                position = new Vector3((i%5)*2, 0, 2 + (i/5)*2),
                avatarColor = Color.green,
                avatarShape = "Cube",
                familyRelation = "Child"
            };
            agents.Add(student);
            SpawnAgent(student, studentPrefab);
        }
    }

    void SpawnAgent(Agent agent, GameObject prefab)
    {
    GameObject go = Instantiate(prefab, agent.position, Quaternion.identity);
    go.name = agent.name;
    // Set label, color, house badge, and family relation
    var label = go.AddComponent<TextMesh>();
    label.text = $"{agent.name}\n{agent.role}\n{agent.house}\n{agent.familyRelation}";
    go.GetComponent<Renderer>().material.color = agent.avatarColor;
    // Optionally change shape, add images, or make interactive
    // Example: move agent to party zone on key press
    go.AddComponent<AgentMover>();
    }
}
// Instructions:
// 1. Create a Unity project, add this script to an empty GameObject.
// 2. Assign simple prefabs for teacherPrefab, studentPrefab, protectorPrefab, motherPrefab, housePrefab, and partyZonePrefab (e.g. colored cubes/spheres).
// 3. Press Play to see your agent family, houses, and party zone in the scene!
// 4. Agents can be moved interactively (see AgentMover script).
// 5. Expand with more agents, roles, and features as you wish.
using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// BlackRoad Agent World Starter for Unity
/// Visualize teachers, students, and agent families in a 3D world
/// </summary>
public class AgentWorldStarter : MonoBehaviour
{
    [Header("Agent Configuration")]
    public int teacherCount = 20;
    public int studentsPerTeacher = 2;
    
    [Header("Visualization Settings")]
    public Color teacherColor = Color.blue;
    public Color studentColor = Color.green;
    public Color leaderColor = Color.gold;
    public float agentSize = 0.5f;
    public float spacing = 2f;
    
    [Header("World Settings")]
    public Material agentMaterial;
    public bool showLabels = true;
    
    private List<GameObject> agents = new List<GameObject>();
    private readonly string[] leaders = { "phi", "gpt", "mistral", "codex", "lucidia" };
    
    void Start()
    {
        CreateAgentWorld();
    }
    
    /// <summary>
    /// Create the complete agent world with teachers and students
    /// </summary>
    void CreateAgentWorld()
    {
        Debug.Log("🚀 Creating BlackRoad Agent World...");
        
        // Create leaders in a special area
        CreateLeaders();
        
        // Create teachers and their students
        CreateTeachersAndStudents();
        
        Debug.Log($"✅ Created {agents.Count} total agents");
    }
    
    /// <summary>
    /// Create leader agents at the top of the hierarchy
    /// </summary>
    void CreateLeaders()
    {
        Vector3 leaderStartPos = new Vector3(0, 5, 0);
        
        for (int i = 0; i < leaders.Length; i++)
        {
            Vector3 position = leaderStartPos + new Vector3(i * spacing * 2, 0, 0);
            GameObject leader = CreateAgent($"Leader_{leaders[i]}", position, leaderColor, agentSize * 1.5f);
            
            // Add a crown effect for leaders
            CreateCrown(leader.transform);
        }
    }
    
    /// <summary>
    /// Create teachers and assign students to each
    /// </summary>
    void CreateTeachersAndStudents()
    {
        int teachersPerRow = 5;
        Vector3 teacherStartPos = new Vector3(0, 0, 5);
        
        for (int i = 0; i < teacherCount; i++)
        {
            // Calculate teacher position in a grid
            int row = i / teachersPerRow;
            int col = i % teachersPerRow;
            Vector3 teacherPos = teacherStartPos + new Vector3(col * spacing * 3, 0, row * spacing * 4);
            
            // Create teacher
            string leaderName = leaders[i % leaders.Length];
            GameObject teacher = CreateAgent($"Teacher_{i + 1}", teacherPos, teacherColor, agentSize);
            
            // Create students around the teacher
            for (int j = 0; j < studentsPerTeacher; j++)
            {
                float angle = (j * 360f / studentsPerTeacher) * Mathf.Deg2Rad;
                Vector3 offset = new Vector3(Mathf.Cos(angle), 0, Mathf.Sin(angle)) * spacing;
                Vector3 studentPos = teacherPos + offset;
                
                GameObject student = CreateAgent($"Teacher_{i + 1}_Student_{j + 1}", studentPos, studentColor, agentSize * 0.8f);
                
                // Draw line connecting student to teacher
                DrawConnection(student.transform.position, teacher.transform.position, studentColor);
            }
        }
    }
    
    /// <summary>
    /// Create a single agent GameObject
    /// </summary>
    GameObject CreateAgent(string agentName, Vector3 position, Color color, float size)
    {
        GameObject agent = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        agent.name = agentName;
        agent.transform.position = position;
        agent.transform.localScale = Vector3.one * size;
        
        // Set color
        Renderer renderer = agent.GetComponent<Renderer>();
        if (agentMaterial != null)
        {
            Material mat = new Material(agentMaterial);
            mat.color = color;
            renderer.material = mat;
        }
        else
        {
            renderer.material.color = color;
        }
        
        // Add label if enabled
        if (showLabels)
        {
            CreateLabel(agent.transform, agentName);
        }
        
        agents.Add(agent);
        return agent;
    }
    
    /// <summary>
    /// Create a text label above an agent
    /// </summary>
    void CreateLabel(Transform parent, string text)
    {
        GameObject labelObj = new GameObject("Label");
        labelObj.transform.SetParent(parent);
        labelObj.transform.localPosition = Vector3.up * 1.5f;
        
        TextMesh textMesh = labelObj.AddComponent<TextMesh>();
        textMesh.text = text;
        textMesh.fontSize = 20;
        textMesh.anchor = TextAnchor.MiddleCenter;
        textMesh.alignment = TextAlignment.Center;
        textMesh.color = Color.white;
        
        // Make label face camera
        labelObj.AddComponent<Billboard>();
    }
    
    /// <summary>
    /// Create a crown effect for leader agents
    /// </summary>
    void CreateCrown(Transform parent)
    {
        GameObject crown = new GameObject("Crown");
        crown.transform.SetParent(parent);
        crown.transform.localPosition = Vector3.up * 1.2f;
        
        for (int i = 0; i < 5; i++)
        {
            GameObject spike = GameObject.CreatePrimitive(PrimitiveType.Cube);
            spike.transform.SetParent(crown.transform);
            spike.transform.localScale = new Vector3(0.1f, 0.3f, 0.1f);
            
            float angle = (i * 72f) * Mathf.Deg2Rad;
            float radius = 0.3f;
            spike.transform.localPosition = new Vector3(Mathf.Cos(angle) * radius, 0, Mathf.Sin(angle) * radius);
            
            Renderer renderer = spike.GetComponent<Renderer>();
            renderer.material.color = Color.yellow;
        }
    }
    
    /// <summary>
    /// Draw a line connection between two points
    /// </summary>
    void DrawConnection(Vector3 from, Vector3 to, Color color)
    {
        GameObject lineObj = new GameObject("Connection");
        LineRenderer line = lineObj.AddComponent<LineRenderer>();
        
        line.startWidth = 0.05f;
        line.endWidth = 0.05f;
        line.positionCount = 2;
        line.SetPosition(0, from);
        line.SetPosition(1, to);
        
        Material lineMat = new Material(Shader.Find("Sprites/Default"));
        lineMat.color = color;
        line.material = lineMat;
        
        agents.Add(lineObj);
    }
}

/// <summary>
/// Simple billboard component to make objects face the camera
/// </summary>
public class Billboard : MonoBehaviour
{
    void LateUpdate()
    {
        if (Camera.main != null)
        {
            transform.LookAt(Camera.main.transform);
            transform.Rotate(0, 180, 0);
        }
    }
}
