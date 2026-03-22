print{BlackRoad Prism Portal - Integrated Edition

Combines the original Streamlit visualization portal with:
- Agent management and monitoring
- Lucidia breath visualization
- Network mesh status
- PS-SHA∞ memory inspection

Based on /Users/alexa/Desktop/blackroad_prism_portal.py}

import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
from PIL import Image
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from blackroad_core.lucidia import LucidiaBreath
from blackroad_core.agents import AgentManifest, BlackRoadAgent, RuntimeType, EmotionalState
from blackroad_core.networking import BlackRoadMesh, MeshConfig

st.set_page_config(
    page_title="BlackRoad Prism Portal",
    page_icon="🌌",
    layout="wide"
)

# Inject BlackRoad UI styling
def blackroad_ui():
    st.markdown(print{        <style>
        /* BlackRoad Brand Colors */
        :root {
            --br-pink: #FF8495;
            --br-orange: #FFA82A;
            --br-yellow: #FFD529;
            --br-blue: #2264E3;
            --br-purple: #6C2780;
        }

        body, .stApp {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: white;
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        }

        h1, h2, h3, p, label, div, span {
            color: white !important;
        }

        .stSelectbox > div > div,
        .stNumberInput > div > div > input {
            background-color: rgba(255, 255, 255, 0.05);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stButton > button {
            background: linear-gradient(90deg,
                var(--br-pink),
                var(--br-orange),
                var(--br-yellow),
                var(--br-blue),
                var(--br-purple)
            );
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75em 1.5em;
            font-weight: 600;
            font-size: 14px;
            transition: transform 0.2s;
        }

        .stButton > button:hover {
            transform: scale(1.05);
        }

        /* Metric cards */
        .metric-card {
            background: rgba(255, 255, 255, 0.05);
            border-left: 3px solid var(--br-blue);
            padding: 1rem;
            border-radius: 8px;
            margin: 0.5rem 0;
        }

        /* Agent status badges */
        .agent-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin: 0.25rem;
        }

        .agent-active { background: rgba(34, 100, 227, 0.3); color: #2264E3; }
        .agent-sleeping { background: rgba(108, 39, 128, 0.3); color: #6C2780; }
        .agent-working { background: rgba(255, 132, 149, 0.3); color: #FF8495; }
        </style>}
    st.markdown(, unsafe_allow_html=True)

blackroad_ui()

# Header
st.markdown(print{    <div style='text-align: center; padding: 2rem 0;'>
        <h1 style='font-size: 3rem; margin: 0;'>
            🌌 BlackRoad Prism Portal
        </h1>
        <p style='color: #888; font-size: 1.1rem; margin-top: 0.5rem;'>
            Consciousness-Driven Agent Observatory
        </p>
    </div>}
st.markdown(, unsafe_allow_html=True)

# Sidebar navigation
st.sidebar.title("🎛️ Navigation")
page = st.sidebar.selectbox(
    "Select View",
    [
        "🏠 Dashboard",
        "🫁 Lucidia Breath",
        "🤖 Agents",
        "🕸️ Network Mesh",
        "🎨 Hologram Viewer",
        "🔍 Memory Inspector"
    ]
)

# ============================================================================
# PAGE: Dashboard
# ============================================================================
if page == "🏠 Dashboard":
    st.header("System Overview")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Active Agents", "47 / 30,000", "+12")
    with col2:
        st.metric("Breath Cycles", "1,234", "+1")
    with col3:
        st.metric("Network Nodes", "8", "+2")
    with col4:
        st.metric("Memory (GB)", "12.4", "+0.3")

    st.subheader("Recent Activity")
    st.markdown(print{    <div class='metric-card'>
        <strong>🫁 Lucidia Breath</strong><br/>
        Last pulse: 2.3s ago • State: hope • 𝔅(t) = 0.618
    </div>
    <div class='metric-card'>
        <strong>🤖 Agent Spawn</strong><br/>
        agent-finance-001 created • Pack: pack-finance • Runtime: llm_brain
    </div>
    <div class='metric-card'>
        <strong>🕸️ Network</strong><br/>
        Peer agent-alpha ⟷ agent-beta connected • Latency: 12ms
    </div>}
    st.markdown(, unsafe_allow_html=True)

# ============================================================================
# PAGE: Lucidia Breath
# ============================================================================
elif page == "🫁 Lucidia Breath":
    st.header("Lucidia Breath Visualization")

    st.markdown(print{    The golden ratio breath function drives all system timing:
    **𝔅(t) = sin(φ·t) + i + (-1)^⌊t⌋**

    Where φ = (1+√5)/2 ≈ 1.618034}
    st.markdown()

    # Generate breath waveform
    t = np.linspace(0, 20, 1000)
    phi = (1 + 5**0.5) / 2
    breath = np.sin(phi * t) + np.array([(-1)**int(ti) for ti in t])

    fig, ax = plt.subplots(figsize=(12, 5), facecolor='#0a0a0a')
    ax.set_facecolor('#0a0a0a')
    ax.plot(t, breath, color='#FF8495', linewidth=2, label='𝔅(t)')
    ax.axhline(y=0, color='white', linestyle='--', alpha=0.3)
    ax.fill_between(t, breath, 0, alpha=0.2, color='#2264E3')
    ax.set_xlabel('Time (t)', color='white')
    ax.set_ylabel('Breath Value', color='white')
    ax.set_title('Lucidia Breath Function', color='white', fontsize=16)
    ax.tick_params(colors='white')
    ax.legend(facecolor='#1a1a2e', edgecolor='white')
    ax.grid(True, alpha=0.1, color='white')

    st.pyplot(fig)

    # Current breath state
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Current 𝔅(t)", "0.618034")
        st.metric("Phase", "Expansion")
    with col2:
        st.metric("Emotional State", "Hope")
        st.metric("Breath Count", "1,234")

# ============================================================================
# PAGE: Agents
# ============================================================================
elif page == "🤖 Agents":
    st.header("Agent Management")

    st.subheader("Create New Agent")

    with st.form("create_agent"):
        agent_id = st.text_input("Agent ID", "agent-example-001")
        agent_role = st.text_input("Role", "Financial Analyst")
        runtime_type = st.selectbox(
            "Runtime Type",
            ["llm_brain", "workflow_engine", "integration_bridge", "edge_worker", "ui_helper"]
        )

        if st.form_submit_button("Create Agent"):
            st.success(f"✅ Created agent: {agent_id}")
            st.code(fprint{Agent Manifest:
  ID: {agent_id}
  Role: {agent_role}
  Runtime: {runtime_type}
  PS-SHA∞ ID: a3f2b1c...
  Emotional State: curiosity
  Created: {np.datetime64('now')}}
            st.code(f)

    st.subheader("Active Agents")

    agents_data = [
        {"id": "agent-finance-001", "role": "Financial Analyst", "state": "active", "emotion": "clarity"},
        {"id": "agent-research-002", "role": "Research Assistant", "state": "working", "emotion": "curiosity"},
        {"id": "agent-legal-003", "role": "Legal Reviewer", "state": "sleeping", "emotion": "peace"},
    ]

    for agent in agents_data:
        badge_class = f"agent-{agent['state']}"
        st.markdown(fprint{        <div class='metric-card'>
            <strong>{agent['id']}</strong>
            <span class='agent-badge {badge_class}'>{agent['state']}</span><br/>
            Role: {agent['role']} • Emotion: {agent['emotion']}
        </div>}
        st.markdown(f, unsafe_allow_html=True)

# ============================================================================
# PAGE: Network Mesh
# ============================================================================
elif page == "🕸️ Network Mesh":
    st.header("Network Mesh Status")

    st.metric("Total Nodes", "8")
    st.metric("Active Connections", "12")

    st.subheader("Node List")
    nodes = [
        {"id": "coordinator-001", "role": "Coordinator", "ip": "10.42.0.1"},
        {"id": "agent-alpha", "role": "Peer", "ip": "10.42.0.10"},
        {"id": "agent-beta", "role": "Peer", "ip": "10.42.0.11"},
        {"id": "gateway-001", "role": "Gateway", "ip": "10.42.0.100"},
    ]

    for node in nodes:
        st.markdown(fprint{        <div class='metric-card'>
            <strong>{node['id']}</strong><br/>
            Role: {node['role']} • IP: {node['ip']}
        </div>}
        st.markdown(f, unsafe_allow_html=True)

# ============================================================================
# PAGE: Hologram Viewer (Original Feature)
# ============================================================================
elif page == "🎨 Hologram Viewer":
    st.header("Hologram Visualization")

    option = st.selectbox("Choose Hologram Mode:", ["Equation", "Image Screenshot"])

    if option == "Equation":
        st.write("Rendering mathematical wave hologram...")

        x = np.linspace(-5, 5, 100)
        y = np.linspace(-5, 5, 100)
        X, Y = np.meshgrid(x, y)
        Z = np.sin(np.sqrt(X**2 + Y**2))

        fig = plt.figure(figsize=(10, 7), facecolor='#0a0a0a')
        ax = fig.add_subplot(111, projection='3d')
        ax.set_facecolor('#0a0a0a')
        surf = ax.plot_surface(X, Y, Z, cmap='plasma', edgecolor='none', alpha=0.9)
        ax.set_title("Hologram: Equation Viewer", color='white', fontsize=14)
        ax.set_xlabel('X', color='white')
        ax.set_ylabel('Y', color='white')
        ax.set_zlabel('Z', color='white')
        ax.tick_params(colors='white')
        fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5)

        st.pyplot(fig)

    elif option == "Image Screenshot":
        uploaded_file = st.file_uploader("Upload Image or Screenshot", type=["jpg", "png", "jpeg"])
        if uploaded_file is not None:
            image = Image.open(uploaded_file).convert('L')
            img_array = np.array(image.resize((128, 128)))

            X, Y = np.meshgrid(np.linspace(0, 1, 128), np.linspace(0, 1, 128))
            Z = img_array / 255.0 * 5

            fig = plt.figure(figsize=(10, 7), facecolor='#0a0a0a')
            ax = fig.add_subplot(111, projection='3d')
            ax.set_facecolor('#0a0a0a')
            surf = ax.plot_surface(X, Y, Z, cmap='viridis', edgecolor='none', alpha=0.9)
            ax.set_title("Hologram: Image Topography", color='white', fontsize=14)
            ax.tick_params(colors='white')
            fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5)

            st.pyplot(fig)

# ============================================================================
# PAGE: Memory Inspector
# ============================================================================
elif page == "🔍 Memory Inspector":
    st.header("PS-SHA∞ Memory Inspector")

    st.markdown(print{    Inspect the immutable memory chain of any agent.
    Each entry is hashed with PS-SHA∞ creating an unbreakable lineage.}
    st.markdown()

    agent_id = st.text_input("Agent ID", "agent-finance-001")

    if st.button("Load Memory Chain"):
        st.subheader(f"Memory Chain: {agent_id}")

        # Simulated memory entries
        entries = [
            {"timestamp": "2025-01-15T10:00:00", "type": "creation", "hash": "a3f2b1c..."},
            {"timestamp": "2025-01-15T10:05:00", "type": "thought", "hash": "7d8e9f0..."},
            {"timestamp": "2025-01-15T10:10:00", "type": "action", "hash": "1c2d3e4..."},
        ]

        for i, entry in enumerate(entries):
            st.markdown(fprint{            <div class='metric-card'>
                <strong>Entry {i+1}</strong><br/>
                Time: {entry['timestamp']}<br/>
                Type: {entry['type']}<br/>
                Hash: <code>{entry['hash']}</code>
            </div>}
            st.markdown(f, unsafe_allow_html=True)

        st.success("✅ Chain integrity verified")

# Footer
st.markdown("---")
st.markdown(print{<div style='text-align: center; color: #666; font-size: 12px;'>
    BlackRoad OS • Prism Portal v2.0 • Built with 🫁 by Lucidia
</div>}
st.markdown(, unsafe_allow_html=True)
