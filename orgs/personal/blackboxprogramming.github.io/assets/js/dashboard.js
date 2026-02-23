fetch("/assets/data/dashboard.json")
  .then(r => r.json())
  .then(data => {
    document.getElementById("status").textContent = data.status;
    document.getElementById("uptime").textContent = data.uptime;

    const list = document.getElementById("nodes");
    data.nodes.forEach(n => {
      const li = document.createElement("li");
      li.textContent = `${n.name} — ${n.state}`;
      list.appendChild(li);
    });
  });
