#!/usr/bin/env python3
"""BlackRoad Education — Interactive CLI course runner with progress tracking."""
import json, sqlite3, os, time, random

DB = os.path.expanduser("~/.blackroad/education.db")

COURSES = {
    "blackroad-101": {
        "title": "BlackRoad OS 101",
        "lessons": [
            {"id": "l1", "title": "What is BlackRoad OS?",
             "content": "BlackRoad OS is an AI agent orchestration platform supporting 30,000 concurrent agents.",
             "quiz": [{"q": "How many agents can BlackRoad support?", "a": "30000", "hint": "thirty thousand"}]},
            {"id": "l2", "title": "The br CLI",
             "content": "The `br` CLI is your gateway. Run `br help` to see all commands.",
             "quiz": [{"q": "What command shows help?", "a": "br help", "hint": "br + help"}]},
            {"id": "l3", "title": "World Generation",
             "content": "Worlds are AI-generated artifacts. `br worlds stats` shows live stats.",
             "quiz": [{"q": "What command shows world stats?", "a": "br worlds stats", "hint": "worlds + stats"}]},
        ]
    }
}

def init():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = sqlite3.connect(DB)
    c.execute("CREATE TABLE IF NOT EXISTS progress (user TEXT, course TEXT, lesson TEXT, completed INTEGER, ts REAL, PRIMARY KEY(user,course,lesson))")
    c.commit()
    return c

def run_course(course_id: str, user: str = "learner"):
    course = COURSES.get(course_id)
    if not course: print(f"Course {course_id} not found. Available: {list(COURSES.keys())}"); return
    c = init()
    print(f"\\n🎓 {course[\"title\"]}\\n{─*50}")
    for lesson in course["lessons"]:
        done = c.execute("SELECT completed FROM progress WHERE user=? AND course=? AND lesson=?", (user,course_id,lesson["id"])).fetchone()
        status = "✅" if done and done[0] else "  "
        print(f"  {status} {lesson[\"id\"]}: {lesson[\"title\"]}")
    print()
    for lesson in course["lessons"]:
        done = c.execute("SELECT completed FROM progress WHERE user=? AND course=? AND lesson=?", (user,course_id,lesson["id"])).fetchone()
        if done and done[0]: continue
        print(f"\\n📖 {lesson[\"title\"]}\\n")
        print(f"  {lesson[\"content\"]}\\n")
        for q in lesson.get("quiz", []):
            ans = input(f"  ❓ {q[\"q\"]} > ").strip().lower()
            if ans == q["a"].lower() or q["a"].lower() in ans:
                print("  ✅ Correct!\\n")
                c.execute("INSERT OR REPLACE INTO progress VALUES (?,?,?,1,?)", (user,course_id,lesson["id"],time.time()))
                c.commit()
            else:
                print(f"  💡 Hint: {q[\"hint\"]}\\n")
    print("\\n🏆 Course complete!\\n")

if __name__ == "__main__":
    import sys
    course = sys.argv[1] if len(sys.argv)>1 else "blackroad-101"
    user = sys.argv[2] if len(sys.argv)>2 else "learner"
    run_course(course, user)

