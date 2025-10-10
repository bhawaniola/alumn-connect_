import sqlite3
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import json
import random
from app import init_db

def seed_database():
    # Initialize database tables first
    init_db()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute('DELETE FROM project_applications')
    cursor.execute('DELETE FROM project_positions')
    cursor.execute('DELETE FROM conversations')
    cursor.execute('DELETE FROM messages')
    cursor.execute('DELETE FROM blog_likes')
    cursor.execute('DELETE FROM user_skills')
    cursor.execute('DELETE FROM user_achievements')
    cursor.execute('DELETE FROM user_languages')
    cursor.execute('DELETE FROM mentorship_requests')
    cursor.execute('DELETE FROM blog_posts')
    cursor.execute('DELETE FROM projects')
    cursor.execute('DELETE FROM users')
    
    # ----------------- Users -----------------
    users = [
        # Alumni
        {'name': 'Dr. Rajesh Kumar', 'email': 'rajesh.kumar@iitkgp.ac.in', 'password': 'password123', 'role': 'alumni', 'graduation_year': 2010, 'department': 'Computer Science and Engineering'},
        {'name': 'Priya Sharma', 'email': 'priya.sharma@iitkgp.ac.in', 'password': 'password123', 'role': 'alumni', 'graduation_year': 2012, 'department': 'Electrical Engineering'},
        {'name': 'Amit Singh', 'email': 'amit.singh@iitkgp.ac.in', 'password': 'password123', 'role': 'alumni', 'graduation_year': 2015, 'department': 'Mechanical Engineering'},
        {'name': 'Ananya Iyer', 'email': 'ananya.iyer@iitkgp.ac.in', 'password': 'password123', 'role': 'alumni', 'graduation_year': 2013, 'department': 'Biotechnology'},
        {'name': 'Vikram Patel', 'email': 'vikram.patel@iitkgp.ac.in', 'password': 'password123', 'role': 'alumni', 'graduation_year': 2014, 'department': 'Civil Engineering'},
        {'name': 'Meera Krishnan', 'email': 'meera.krishnan@iitkgp.ac.in', 'password': 'password123', 'role': 'alumni', 'graduation_year': 2011, 'department': 'Chemical Engineering'},
        
        # Students
        {'name': 'Sneha Reddy', 'email': 'sneha.reddy@iitkgp.ac.in', 'password': 'password123', 'role': 'student', 'graduation_year': None, 'department': 'Computer Science and Engineering'},
        {'name': 'Karan Malhotra', 'email': 'karan.malhotra@iitkgp.ac.in', 'password': 'password123', 'role': 'student', 'graduation_year': None, 'department': 'Electrical Engineering'},
        {'name': 'Neha Gupta', 'email': 'neha.gupta@iitkgp.ac.in', 'password': 'password123', 'role': 'student', 'graduation_year': None, 'department': 'Biotechnology'},
        {'name': 'Arjun Mehta', 'email': 'arjun.mehta@iitkgp.ac.in', 'password': 'password123', 'role': 'student', 'graduation_year': None, 'department': 'Mechanical Engineering'},
        {'name': 'Divya Nair', 'email': 'divya.nair@iitkgp.ac.in', 'password': 'password123', 'role': 'student', 'graduation_year': None, 'department': 'Chemical Engineering'},
        {'name': 'Rohan Desai', 'email': 'rohan.desai@iitkgp.ac.in', 'password': 'password123', 'role': 'student', 'graduation_year': None, 'department': 'Civil Engineering'}
    ]
    
    user_ids = {}
    for user in users:
        password_hash = generate_password_hash(user['password'])
        cursor.execute('''
            INSERT INTO users (name, email, password_hash, role, graduation_year, department)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user['name'], user['email'], password_hash, user['role'], user['graduation_year'], user['department']))
        user_ids[user['email']] = cursor.lastrowid

    # ----------------- Projects -----------------
    placeholder_imgs = [
        'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555949963-aa79dcee981d?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1581093588401-16f2d7f3d8ac?q=80&w=1200&auto=format&fit=crop'
    ]
    projects = [
        {
            'title': 'AI-Powered Healthcare Diagnostics',
            'description': 'Developing an ML platform for early disease detection using medical imaging and deep learning algorithms.',
            'category': 'Healthcare AI',
            'status': 'active',
            'team_members': json.dumps(['Dr. Rajesh Kumar','Priya Sharma']),
            'tags': json.dumps(['AI/ML','Healthcare','Computer Vision','Deep Learning']),
            'created_by': user_ids['rajesh.kumar@iitkgp.ac.in'],
            'skills_required': json.dumps(['Python','TensorFlow','Computer Vision','Medical Imaging']),
            'stipend': 25000,
            'duration': '6 months',
            'location': 'Remote',
            'work_type': 'remote',
            'images': json.dumps(placeholder_imgs[:2]),
            'project_links': json.dumps([{'label': 'Website', 'url': 'https://example.com/ai-health'}, {'label': 'GitHub', 'url': 'https://github.com/example/ai-health'}]),
            'jd_pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            'title': 'Sustainable Energy Management System',
            'description': 'Building a smart grid optimization system for renewable energy distribution and management.',
            'category': 'Clean Tech',
            'status': 'active',
            'team_members': json.dumps(['Priya Sharma']),
            'tags': json.dumps(['IoT','Sustainability','Energy','Smart Grid']),
            'created_by': user_ids['priya.sharma@iitkgp.ac.in'],
            'skills_required': json.dumps(['IoT','Embedded Systems','Python','Data Analytics']),
            'stipend': 20000,
            'duration': '4 months',
            'location': 'Bangalore',
            'work_type': 'hybrid',
            'images': json.dumps(placeholder_imgs[1:]),
            'project_links': json.dumps([{'label': 'Pitch', 'url': 'https://example.com/clean-tech'}]),
            'jd_pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            'title': 'EdTech Learning Platform',
            'description': 'Creating adaptive AI-powered learning paths for K-12 education with personalized content delivery.',
            'category': 'Education',
            'status': 'completed',
            'team_members': json.dumps(['Amit Singh']),
            'tags': json.dumps(['EdTech','AI','Education','Personalization']),
            'created_by': user_ids['amit.singh@iitkgp.ac.in'],
            'skills_required': json.dumps(['React','Node.js','MongoDB','AI/ML']),
            'stipend': 18000,
            'duration': '5 months',
            'location': 'Mumbai',
            'work_type': 'onsite',
            'images': json.dumps(placeholder_imgs[:1]),
            'project_links': json.dumps([]),
            'jd_pdf': None
        },
        {
            'title': 'Blockchain Supply Chain Tracker',
            'description': 'Implementing blockchain-based secure and transparent supply chain tracking system.',
            'category': 'FinTech',
            'status': 'active',
            'team_members': json.dumps(['Dr. Rajesh Kumar']),
            'tags': json.dumps(['Blockchain','Supply Chain','Transparency','Security']),
            'created_by': user_ids['rajesh.kumar@iitkgp.ac.in'],
            'skills_required': json.dumps(['Blockchain','Solidity','Web3.js','Smart Contracts']),
            'stipend': 30000,
            'duration': '6 months',
            'location': 'Remote',
            'work_type': 'remote',
            'images': json.dumps(placeholder_imgs),
            'project_links': json.dumps([{'label': 'Docs', 'url': 'https://example.com/scm-docs'}]),
            'jd_pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            'title': 'Smart Agriculture Monitoring',
            'description': 'IoT-based real-time monitoring system for crop health, soil conditions, and weather patterns.',
            'category': 'AgriTech',
            'status': 'active',
            'team_members': json.dumps(['Ananya Iyer']),
            'tags': json.dumps(['IoT','Agriculture','Monitoring','Data Analytics']),
            'created_by': user_ids['ananya.iyer@iitkgp.ac.in'],
            'skills_required': json.dumps(['IoT','Sensors','Python','Data Visualization']),
            'stipend': 15000,
            'duration': '3 months',
            'location': 'Pune',
            'work_type': 'hybrid',
            'images': json.dumps(placeholder_imgs[::2]),
            'project_links': json.dumps([{'label': 'Dashboard', 'url': 'https://example.com/agri-dash'}]),
            'jd_pdf': None
        },
        {
            'title': 'Urban Infrastructure Planning Tool',
            'description': 'GIS-based tool for urban planning and infrastructure development with 3D visualization.',
            'category': 'Civil Tech',
            'status': 'active',
            'team_members': json.dumps(['Vikram Patel']),
            'tags': json.dumps(['GIS','Urban Planning','3D Modeling','Infrastructure']),
            'created_by': user_ids['vikram.patel@iitkgp.ac.in'],
            'skills_required': json.dumps(['GIS','AutoCAD','Python','3D Modeling']),
            'stipend': 22000,
            'duration': '5 months',
            'location': 'Delhi',
            'work_type': 'onsite',
            'images': json.dumps(placeholder_imgs[:2]),
            'project_links': json.dumps([]),
            'jd_pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            'title': 'Chemical Process Optimization Platform',
            'description': 'AI-driven platform for optimizing chemical manufacturing processes and reducing waste.',
            'category': 'Chemical Engineering',
            'status': 'active',
            'team_members': json.dumps(['Meera Krishnan']),
            'tags': json.dumps(['Process Engineering','AI','Optimization','Sustainability']),
            'created_by': user_ids['meera.krishnan@iitkgp.ac.in'],
            'skills_required': json.dumps(['Chemical Engineering','Python','Machine Learning','Process Simulation']),
            'stipend': 20000,
            'duration': '4 months',
            'location': 'Chennai',
            'work_type': 'hybrid',
            'images': json.dumps(placeholder_imgs[1:]),
            'project_links': json.dumps([{'label': 'Case Study', 'url': 'https://example.com/chem-case'}]),
            'jd_pdf': None
        },
        {
            'title': 'Robotics for Manufacturing Automation',
            'description': 'Developing robotic systems for automated manufacturing and quality control.',
            'category': 'Robotics',
            'status': 'active',
            'team_members': json.dumps(['Amit Singh']),
            'tags': json.dumps(['Robotics','Automation','Manufacturing','AI']),
            'created_by': user_ids['amit.singh@iitkgp.ac.in'],
            'skills_required': json.dumps(['Robotics','ROS','Python','Computer Vision']),
            'stipend': 28000,
            'duration': '6 months',
            'location': 'Hyderabad',
            'work_type': 'onsite',
            'images': json.dumps(placeholder_imgs),
            'project_links': json.dumps([{'label': 'Spec', 'url': 'https://example.com/robotics-spec'}]),
            'jd_pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        }
    ]
    
    project_ids = {}
    for project in projects:
        cursor.execute('''
            INSERT INTO projects (title, description, category, status, team_members, tags, created_by, skills_required, images, project_links, jd_pdf, contact_details, team_roles, partners, funding, highlights)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (project['title'], project['description'], project['category'], project['status'], project['team_members'], project['tags'], project['created_by'], 
              project.get('skills_required'), project.get('images'), project.get('project_links'), project.get('jd_pdf'), 
              project.get('contact_details'), project.get('team_roles'), project.get('partners'), project.get('funding'), project.get('highlights')))
        project_ids[project['title']] = cursor.lastrowid

    # ----------------- Project Positions -----------------
    project_positions = [
        # AI-Powered Healthcare Diagnostics - 3 positions
        {'project_id': project_ids['AI-Powered Healthcare Diagnostics'], 'title': 'Machine Learning Engineer', 'description': 'Develop and train deep learning models for medical image analysis', 'required_skills': json.dumps(['Python', 'TensorFlow', 'PyTorch', 'Computer Vision']), 'count': 2, 'filled_count': 1, 'is_active': True},
        {'project_id': project_ids['AI-Powered Healthcare Diagnostics'], 'title': 'Backend Developer', 'description': 'Build scalable APIs and database architecture', 'required_skills': json.dumps(['Python', 'Flask', 'PostgreSQL', 'REST API']), 'count': 1, 'filled_count': 0, 'is_active': True},
        {'project_id': project_ids['AI-Powered Healthcare Diagnostics'], 'title': 'UI/UX Designer', 'description': 'Design intuitive interfaces for healthcare professionals', 'required_skills': json.dumps(['Figma', 'Adobe XD', 'UI Design', 'Healthcare UX']), 'count': 1, 'filled_count': 0, 'is_active': True},
        
        # Sustainable Energy Management System - 2 positions
        {'project_id': project_ids['Sustainable Energy Management System'], 'title': 'DevOps Engineer', 'description': 'Develop IoT sensors and edge computing solutions', 'required_skills': json.dumps(['IoT', 'Embedded Systems', 'C++', 'MQTT']), 'count': 2, 'filled_count': 0, 'is_active': True},
        {'project_id': project_ids['Sustainable Energy Management System'], 'title': 'Data Analyst', 'description': 'Analyze energy consumption patterns and optimize grid performance', 'required_skills': json.dumps(['Python', 'Data Analytics', 'Power BI', 'SQL']), 'count': 1, 'filled_count': 0, 'is_active': True},
        
        # Blockchain Supply Chain Tracker - 3 positions
        {'project_id': project_ids['Blockchain Supply Chain Tracker'], 'title': 'Blockchain Developer', 'description': 'Develop smart contracts and blockchain infrastructure', 'required_skills': json.dumps(['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts']), 'count': 2, 'filled_count': 0, 'is_active': True},
        {'project_id': project_ids['Blockchain Supply Chain Tracker'], 'title': 'Frontend Developer', 'description': 'Build responsive web interface for supply chain tracking', 'required_skills': json.dumps(['React', 'TypeScript', 'Web3.js', 'TailwindCSS']), 'count': 1, 'filled_count': 0, 'is_active': True},
        
        # Smart Agriculture Monitoring - 2 positions
        {'project_id': project_ids['Smart Agriculture Monitoring'], 'title': 'Software Developer', 'description': 'Design and deploy sensor networks for crop monitoring', 'required_skills': json.dumps(['IoT', 'Sensors', 'Arduino', 'Raspberry Pi']), 'count': 1, 'filled_count': 1, 'is_active': False},
        {'project_id': project_ids['Smart Agriculture Monitoring'], 'title': 'Full Stack Developer', 'description': 'Build web dashboard for real-time monitoring', 'required_skills': json.dumps(['React', 'Node.js', 'MongoDB', 'Chart.js']), 'count': 1, 'filled_count': 0, 'is_active': True},
        
        # Urban Infrastructure Planning Tool - 2 positions
        {'project_id': project_ids['Urban Infrastructure Planning Tool'], 'title': 'Research Analyst', 'description': 'Develop GIS-based mapping and analysis tools', 'required_skills': json.dumps(['GIS', 'ArcGIS', 'QGIS', 'Python']), 'count': 1, 'filled_count': 0, 'is_active': True},
        {'project_id': project_ids['Urban Infrastructure Planning Tool'], 'title': 'Product Designer', 'description': 'Create 3D models and visualization for urban planning', 'required_skills': json.dumps(['Three.js', 'Blender', 'WebGL', 'AutoCAD']), 'count': 1, 'filled_count': 0, 'is_active': True},
        
        # Chemical Process Optimization Platform - 2 positions
        {'project_id': project_ids['Chemical Process Optimization Platform'], 'title': 'Consultant', 'description': 'Optimize chemical manufacturing processes using AI', 'required_skills': json.dumps(['Chemical Engineering', 'Process Simulation', 'Python', 'Optimization']), 'count': 1, 'filled_count': 1, 'is_active': False},
        {'project_id': project_ids['Chemical Process Optimization Platform'], 'title': 'Machine Learning Engineer', 'description': 'Develop predictive models for process optimization', 'required_skills': json.dumps(['Machine Learning', 'Python', 'TensorFlow', 'Data Science']), 'count': 1, 'filled_count': 0, 'is_active': True},
        
        # Robotics for Manufacturing Automation - 3 positions
        {'project_id': project_ids['Robotics for Manufacturing Automation'], 'title': 'Software Developer', 'description': 'Design and program robotic systems for manufacturing', 'required_skills': json.dumps(['Robotics', 'ROS', 'Python', 'Control Systems']), 'count': 2, 'filled_count': 0, 'is_active': True},
        {'project_id': project_ids['Robotics for Manufacturing Automation'], 'title': 'AI Engineer', 'description': 'Develop vision systems for quality control', 'required_skills': json.dumps(['Computer Vision', 'OpenCV', 'Python', 'Deep Learning']), 'count': 1, 'filled_count': 0, 'is_active': True},
        {'project_id': project_ids['Robotics for Manufacturing Automation'], 'title': 'Intern', 'description': 'Assist with testing and documentation of robotic systems', 'required_skills': json.dumps(['Python', 'Documentation', 'Testing']), 'count': 2, 'filled_count': 0, 'is_active': True},
    ]
    
    position_ids = {}
    for pos in project_positions:
        cursor.execute('''
            INSERT INTO project_positions (project_id, title, description, required_skills, count, filled_count, is_active, stipend, duration, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (pos['project_id'], pos['title'], pos['description'], pos['required_skills'], pos['count'], pos['filled_count'], pos['is_active'], 
              pos.get('stipend'), pos.get('duration'), pos.get('location')))
        position_ids[f"{pos['project_id']}_{pos['title']}"] = cursor.lastrowid

    # ----------------- Blog Posts -----------------
    blog_posts = [
        {'title': 'From IIT KGP to Building a $50M Startup', 'content': 'My journey from being a student at IIT Kharagpur to building a successful healthcare AI startup. Learn about the challenges, failures, and eventual success...', 'category': 'Career', 'author_id': user_ids['rajesh.kumar@iitkgp.ac.in']},
        {'title': 'How IIT KGP Shaped My Vision for Sustainable Technology', 'content': 'The experiences and learnings at IIT KGP that shaped my passion for sustainable technology and renewable energy solutions...', 'category': 'Startup', 'author_id': user_ids['priya.sharma@iitkgp.ac.in']},
        {'title': 'Transforming Healthcare with AI', 'content': 'How our ML project evolved into a global healthcare AI platform serving millions of patients. The technical and business challenges we faced...', 'category': 'Technology', 'author_id': user_ids['rajesh.kumar@iitkgp.ac.in']},
        {'title': 'The Future of Work: How AI is Changing the Job Market', 'content': 'An in-depth analysis of how AI is transforming the job market and what skills students need to develop for future careers...', 'category': 'Career', 'author_id': user_ids['amit.singh@iitkgp.ac.in']},
        {'title': 'Biotechnology Innovations in Agriculture', 'content': 'Exploring how biotechnology is revolutionizing agriculture and solving food security challenges in India...', 'category': 'Technology', 'author_id': user_ids['ananya.iyer@iitkgp.ac.in']},
        {'title': 'Smart Cities: The Role of Civil Engineers', 'content': 'How civil engineers are leveraging technology to build smarter, more sustainable cities for the future...', 'category': 'Technology', 'author_id': user_ids['vikram.patel@iitkgp.ac.in']},
        {'title': 'Green Chemistry: Sustainable Manufacturing', 'content': 'The importance of green chemistry in creating sustainable manufacturing processes and reducing environmental impact...', 'category': 'Research', 'author_id': user_ids['meera.krishnan@iitkgp.ac.in']},
        {'title': 'Lessons from My First Year as an Entrepreneur', 'content': 'Key lessons learned during my first year of entrepreneurship after graduating from IIT KGP...', 'category': 'Startup', 'author_id': user_ids['amit.singh@iitkgp.ac.in']}
    ]
    
    for post in blog_posts:
        cursor.execute('''
            INSERT INTO blog_posts (title, content, category, author_id)
            VALUES (?, ?, ?, ?)
        ''', (post['title'], post['content'], post['category'], post['author_id']))

    # ----------------- Mentorship Requests -----------------
    mentorship_requests = [
        {'student_id': user_ids['sneha.reddy@iitkgp.ac.in'], 'alumni_id': user_ids['rajesh.kumar@iitkgp.ac.in'], 'message': 'Hi Dr. Kumar, I am very interested in AI and healthcare. Would love to learn from your experience in building healthcare AI solutions.', 'status': 'pending'},
        {'student_id': user_ids['karan.malhotra@iitkgp.ac.in'], 'alumni_id': user_ids['priya.sharma@iitkgp.ac.in'], 'message': 'Hello Priya, I am passionate about renewable energy and would appreciate guidance on sustainable energy projects.', 'status': 'accepted'},
        {'student_id': user_ids['neha.gupta@iitkgp.ac.in'], 'alumni_id': user_ids['ananya.iyer@iitkgp.ac.in'], 'message': 'Hi Ananya, I am a biotechnology student interested in AgriTech. Would love to learn from your experience.', 'status': 'accepted'},
        {'student_id': user_ids['arjun.mehta@iitkgp.ac.in'], 'alumni_id': user_ids['amit.singh@iitkgp.ac.in'], 'message': 'Hello Amit, I am interested in robotics and automation. Could you mentor me on career paths in this field?', 'status': 'pending'},
        {'student_id': user_ids['divya.nair@iitkgp.ac.in'], 'alumni_id': user_ids['meera.krishnan@iitkgp.ac.in'], 'message': 'Hi Meera, I am a chemical engineering student interested in sustainable manufacturing. Would appreciate your guidance.', 'status': 'pending'},
        {'student_id': user_ids['rohan.desai@iitkgp.ac.in'], 'alumni_id': user_ids['vikram.patel@iitkgp.ac.in'], 'message': 'Hello Vikram, I am interested in urban planning and smart cities. Would love to learn from your experience.', 'status': 'accepted'}
    ]
    
    for req in mentorship_requests:
        cursor.execute('''
            INSERT INTO mentorship_requests (student_id, alumni_id, message, status)
            VALUES (?, ?, ?, ?)
        ''', (req['student_id'], req['alumni_id'], req['message'], req['status']))
    
    # ----------------- Project Applications -----------------
    project_applications = [
        # AI Healthcare - Machine Learning Engineer position
        {'project_id': project_ids['AI-Powered Healthcare Diagnostics'], 'position_id': position_ids[f"{project_ids['AI-Powered Healthcare Diagnostics']}_Machine Learning Engineer"], 'student_id': user_ids['sneha.reddy@iitkgp.ac.in'], 'message': 'I have experience with Python and TensorFlow. Completed a course on medical imaging. Very excited about this project!', 'status': 'pending'},
        {'project_id': project_ids['AI-Powered Healthcare Diagnostics'], 'position_id': position_ids[f"{project_ids['AI-Powered Healthcare Diagnostics']}_Machine Learning Engineer"], 'student_id': user_ids['karan.malhotra@iitkgp.ac.in'], 'message': 'I have worked on computer vision projects and am passionate about healthcare AI.', 'status': 'accepted'},
        
        # AI Healthcare - Backend Developer position
        {'project_id': project_ids['AI-Powered Healthcare Diagnostics'], 'position_id': position_ids[f"{project_ids['AI-Powered Healthcare Diagnostics']}_Backend Developer"], 'student_id': user_ids['arjun.mehta@iitkgp.ac.in'], 'message': 'Strong experience in Flask and PostgreSQL. Built several REST APIs for healthcare applications.', 'status': 'pending'},
        
        # Sustainable Energy - DevOps Engineer position
        {'project_id': project_ids['Sustainable Energy Management System'], 'position_id': position_ids[f"{project_ids['Sustainable Energy Management System']}_DevOps Engineer"], 'student_id': user_ids['karan.malhotra@iitkgp.ac.in'], 'message': 'I have experience with IoT and embedded systems. Would love to contribute to renewable energy solutions.', 'status': 'pending'},
        
        # Blockchain - Blockchain Developer position
        {'project_id': project_ids['Blockchain Supply Chain Tracker'], 'position_id': position_ids[f"{project_ids['Blockchain Supply Chain Tracker']}_Blockchain Developer"], 'student_id': user_ids['sneha.reddy@iitkgp.ac.in'], 'message': 'I have been learning blockchain and smart contracts. This project aligns perfectly with my interests.', 'status': 'declined'},
        
        # Smart Agriculture - Software Developer position (filled)
        {'project_id': project_ids['Smart Agriculture Monitoring'], 'position_id': position_ids[f"{project_ids['Smart Agriculture Monitoring']}_Software Developer"], 'student_id': user_ids['neha.gupta@iitkgp.ac.in'], 'message': 'As a biotechnology student, I am very interested in AgriTech. I have experience with IoT sensors.', 'status': 'accepted'},
        
        # Smart Agriculture - Full Stack Developer position
        {'project_id': project_ids['Smart Agriculture Monitoring'], 'position_id': position_ids[f"{project_ids['Smart Agriculture Monitoring']}_Full Stack Developer"], 'student_id': user_ids['sneha.reddy@iitkgp.ac.in'], 'message': 'Experienced with MERN stack. Can build real-time dashboards with Chart.js.', 'status': 'pending'},
        
        # Urban Infrastructure - Research Analyst position
        {'project_id': project_ids['Urban Infrastructure Planning Tool'], 'position_id': position_ids[f"{project_ids['Urban Infrastructure Planning Tool']}_Research Analyst"], 'student_id': user_ids['rohan.desai@iitkgp.ac.in'], 'message': 'I am a civil engineering student with experience in GIS and AutoCAD. Very interested in urban planning.', 'status': 'pending'},
        
        # Chemical Process - Consultant position (filled)
        {'project_id': project_ids['Chemical Process Optimization Platform'], 'position_id': position_ids[f"{project_ids['Chemical Process Optimization Platform']}_Consultant"], 'student_id': user_ids['divya.nair@iitkgp.ac.in'], 'message': 'I have strong background in chemical engineering and Python. Interested in process optimization.', 'status': 'accepted'},
        
        # Robotics - Software Developer position
        {'project_id': project_ids['Robotics for Manufacturing Automation'], 'position_id': position_ids[f"{project_ids['Robotics for Manufacturing Automation']}_Software Developer"], 'student_id': user_ids['arjun.mehta@iitkgp.ac.in'], 'message': 'I have experience with ROS and robotics projects. Very passionate about automation and manufacturing.', 'status': 'pending'},
        
        # Robotics - AI Engineer position
        {'project_id': project_ids['Robotics for Manufacturing Automation'], 'position_id': position_ids[f"{project_ids['Robotics for Manufacturing Automation']}_AI Engineer"], 'student_id': user_ids['sneha.reddy@iitkgp.ac.in'], 'message': 'Worked on OpenCV projects for object detection and quality inspection systems.', 'status': 'pending'}
    ]
    
    for app in project_applications:
        cursor.execute('''
            INSERT INTO project_applications (project_id, position_id, student_id, message, status)
            VALUES (?, ?, ?, ?, ?)
        ''', (app['project_id'], app['position_id'], app['student_id'], app['message'], app['status']))

    # ----------------- Conversations & Messages -----------------
    pairs = [('sneha.reddy@iitkgp.ac.in','rajesh.kumar@iitkgp.ac.in'), ('karan.malhotra@iitkgp.ac.in','priya.sharma@iitkgp.ac.in')]
    for u1, u2 in pairs:
        cursor.execute('''
            INSERT INTO conversations (user1_id, user2_id)
            VALUES (?, ?)
        ''', (user_ids[u1], user_ids[u2]))
        conv_id = cursor.lastrowid
        # Add messages
        for i in range(3):
            sender, receiver = (user_ids[u1], user_ids[u2]) if i%2==0 else (user_ids[u2], user_ids[u1])
            cursor.execute('''
                INSERT INTO messages (sender_id, receiver_id, content)
                VALUES (?, ?, ?)
            ''', (sender, receiver, f"Sample message {i+1} in conversation {conv_id}"))

    # ----------------- Blog Likes -----------------
    for post in blog_posts:
        for student_email in ['sneha.reddy@iitkgp.ac.in','karan.malhotra@iitkgp.ac.in']:
            cursor.execute('''
                INSERT OR IGNORE INTO blog_likes (blog_post_id, user_id)
                VALUES (?, ?)
            ''', (cursor.lastrowid, user_ids[student_email]))

    # ----------------- User Skills -----------------
    skills = ['Python','Machine Learning','Data Analysis','Leadership','Communication']
    for user_email in user_ids:
        for skill in random.sample(skills, 3):
            cursor.execute('''
                INSERT INTO user_skills (user_id, skill_name, skill_type, proficiency_level)
                VALUES (?, ?, ?, ?)
            ''', (user_ids[user_email], skill, 'technical', random.choice(['beginner','intermediate','advanced','expert'])))

    # ----------------- User Achievements -----------------
    achievements = ['Award','Certification','Project','Publication','Other']
    for user_email in user_ids:
        for ach in random.sample(achievements, 2):
            cursor.execute('''
                INSERT INTO user_achievements (user_id, title, achievement_type, date_earned, issuer)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_ids[user_email], f'{ach} Title', ach.lower(), datetime.now().date(), 'IIT KGP'))

    # ----------------- User Languages -----------------
    languages = ['English','Hindi','Spanish','French']
    for user_email in user_ids:
        for lang in random.sample(languages, 2):
            cursor.execute('''
                INSERT INTO user_languages (user_id, language_name, proficiency_level)
                VALUES (?, ?, ?)
            ''', (user_ids[user_email], lang, random.choice(['beginner','intermediate','advanced','native'])))
    
    conn.commit()
    conn.close()
    print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
