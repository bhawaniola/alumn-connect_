import sqlite3
import random
import json
from datetime import datetime, timedelta
from faker import Faker

fake = Faker('en_IN')

DB_PATH = "launchpad.db"  # change if your DB has a different name

def seed_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("🌱 Dropping old data...")
    tables = [
        "users", "projects", "blog_posts", "conversations", "messages",
        "blog_likes", "mentorship_requests", "project_positions",
        "project_applications", "user_skills", "user_achievements", "user_languages"
    ]
    for table in tables:
        cursor.execute(f"DELETE FROM {table}")

    conn.commit()

    print("👤 Seeding users...")
    departments = [
        "Computer Science and Engineering", "Electrical Engineering",
        "Mechanical Engineering", "Civil Engineering",
        "Chemical Engineering", "Biotechnology"
    ]
    roles = ["student", "alumni"]

    users = []
    for i in range(15):
        role = random.choice(roles)
        user = (
            fake.name(),
            fake.email(),
            fake.sha256(raw_output=False),
            role,
            random.randint(2010, 2025) if role == "alumni" else None,
            random.choice(departments),
            random.choice(["Hall 1", "Hall 2", "Hall 3"]),
            random.choice(["CSE", "ECE", "ME", "CE", "BT"]),
            fake.text(max_nb_chars=100),
            fake.company() if role == "alumni" else None,
            fake.job() if role == "alumni" else None,
            fake.city(),
            random.choice(["onsite", "remote", "hybrid"]),
            fake.phone_number(),
            fake.url(),
            f"https://linkedin.com/in/{fake.user_name()}",
            f"https://github.com/{fake.user_name()}",
            fake.image_url()
        )
        users.append(user)

    cursor.executemany('''
        INSERT INTO users (name, email, password_hash, role, graduation_year, department,
                           hall, branch, bio, current_company, current_position,
                           location, work_preference, phone, website, linkedin, github, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', users)
    conn.commit()

    cursor.execute("SELECT id FROM users")
    user_ids = [row[0] for row in cursor.fetchall()]

    print("💼 Seeding projects...")
    projects = []
    for _ in range(10):
        created_by = random.choice(user_ids)
        project = (
            fake.catch_phrase(),
            fake.paragraph(nb_sentences=5),
            random.choice(["AI", "Web", "App", "Blockchain", "EdTech", "FinTech"]),
            random.choice(["active", "completed", "paused"]),
            json.dumps(random.sample(user_ids, k=random.randint(2, 4))),
            json.dumps(fake.words(nb=4)),
            random.randint(10000, 50000),
            f"{random.randint(2, 6)} months",
            json.dumps(fake.words(nb=4)),
            fake.city(),
            random.choice(["remote", "onsite", "hybrid"]),
            created_by
        )
        projects.append(project)

    cursor.executemany('''
        INSERT INTO projects (title, description, category, status, team_members, tags,
                              stipend, duration, skills_required, location, work_type, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', projects)
    conn.commit()

    cursor.execute("SELECT id FROM projects")
    project_ids = [row[0] for row in cursor.fetchall()]

    print("📝 Seeding blog posts...")
    blogs = []
    for _ in range(10):
        blogs.append((
            fake.sentence(nb_words=6),
            fake.paragraph(nb_sentences=10),
            random.choice(["Career", "Tech", "Life", "Startups"]),
            random.choice(user_ids)
        ))
    cursor.executemany('''
        INSERT INTO blog_posts (title, content, category, author_id)
        VALUES (?, ?, ?, ?)
    ''', blogs)
    conn.commit()

    cursor.execute("SELECT id FROM blog_posts")
    blog_ids = [row[0] for row in cursor.fetchall()]

    print("💬 Seeding conversations + messages...")
    conversations = []
    for _ in range(5):
        u1, u2 = random.sample(user_ids, 2)
        conversations.append((u1, u2))
    cursor.executemany('''
        INSERT OR IGNORE INTO conversations (user1_id, user2_id)
        VALUES (?, ?)
    ''', conversations)
    conn.commit()

    cursor.execute("SELECT id, user1_id, user2_id FROM conversations")
    conv_rows = cursor.fetchall()

    messages = []
    for conv in conv_rows:
        c_id, u1, u2 = conv
        for _ in range(random.randint(3, 7)):
            sender = random.choice([u1, u2])
            receiver = u2 if sender == u1 else u1
            messages.append((sender, receiver, fake.sentence(nb_words=10)))
    cursor.executemany('''
        INSERT INTO messages (sender_id, receiver_id, content)
        VALUES (?, ?, ?)
    ''', messages)
    conn.commit()

    print("🧠 Seeding mentorship requests...")
    mentorships = []
    alumni_ids = random.sample(user_ids, 5)
    student_ids = [uid for uid in user_ids if uid not in alumni_ids]
    for _ in range(8):
        mentorships.append((
            random.choice(student_ids),
            random.choice(alumni_ids),
            fake.sentence(nb_words=12),
            random.choice(["pending", "accepted", "declined"])
        ))
    cursor.executemany('''
        INSERT INTO mentorship_requests (student_id, alumni_id, message, status)
        VALUES (?, ?, ?, ?)
    ''', mentorships)
    conn.commit()

    print("👔 Seeding project positions...")
    positions = []
    for pid in project_ids:
        for _ in range(random.randint(1, 3)):
            positions.append((
                pid,
                fake.job(),
                fake.sentence(nb_words=10),
                json.dumps(fake.words(nb=3)),
                random.randint(1, 3),
                random.randint(0, 2),
                1
            ))
    cursor.executemany('''
        INSERT INTO project_positions (project_id, title, description, required_skills,
                                       count, filled_count, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', positions)
    conn.commit()

    cursor.execute("SELECT id FROM project_positions")
    position_ids = [row[0] for row in cursor.fetchall()]

    print("📩 Seeding project applications...")
    applications = []
    for _ in range(10):
        applications.append((
            random.choice(student_ids),
            random.choice(project_ids),
            random.choice(position_ids),
            fake.sentence(nb_words=12),
            random.choice(["pending", "accepted", "declined"])
        ))
    cursor.executemany('''
        INSERT INTO project_applications (student_id, project_id, position_id, message, status)
        VALUES (?, ?, ?, ?, ?)
    ''', applications)
    conn.commit()

    print("🧩 Seeding user skills...")
    for uid in user_ids:
        for _ in range(random.randint(2, 4)):
            cursor.execute('''
                INSERT INTO user_skills (user_id, skill_name, skill_type, proficiency_level)
                VALUES (?, ?, ?, ?)
            ''', (
                uid,
                fake.job(),
                random.choice(["technical", "soft"]),
                random.choice(["beginner", "intermediate", "advanced", "expert"])
            ))

    print("🏅 Seeding user achievements...")
    for uid in user_ids:
        for _ in range(random.randint(1, 3)):
            cursor.execute('''
                INSERT INTO user_achievements (user_id, title, description, achievement_type, date_earned, issuer)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                uid,
                fake.catch_phrase(),
                fake.text(max_nb_chars=80),
                random.choice(["award", "certification", "project", "publication"]),
                (datetime.now() - timedelta(days=random.randint(100, 1500))).date(),
                fake.company()
            ))

    print("🗣️ Seeding user languages...")
    for uid in user_ids:
        for lang in random.sample(["English", "Hindi", "French", "German", "Spanish"], 2):
            cursor.execute('''
                INSERT INTO user_languages (user_id, language_name, proficiency_level)
                VALUES (?, ?, ?)
            ''', (uid, lang, random.choice(["beginner", "intermediate", "advanced", "native"])))

    conn.commit()
    conn.close()
    print("✅ Database successfully seeded with random Faker data!")

if __name__ == "__main__":
    seed_database()
