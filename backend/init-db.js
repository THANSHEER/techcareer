const { db, run } = require('./db');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('Creating database schema...');

    // Create users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create courses table
    await run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        instructor TEXT NOT NULL,
        description TEXT,
        totalModules INTEGER DEFAULT 0,
        price INTEGER DEFAULT 0,
        category TEXT,
        level TEXT,
        duration TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create enrollments table (to track user course enrollments)
    await run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        completedModules INTEGER DEFAULT 0,
        progress INTEGER DEFAULT 0,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        UNIQUE(user_id, course_id)
      )
    `);

    // Insert default courses
    const courses = [
      {
        title: "Web Development Fundamentals",
        instructor: "Alex Johnson",
        description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript to build responsive websites.",
        totalModules: 20,
        price: 799,
        category: "Web Development",
        level: "Beginner",
        duration: "12 weeks"
      },
      {
        title: "Data Science & Machine Learning",
        instructor: "Emma Roberts",
        description: "Learn to analyze and visualize data, build predictive models, and implement machine learning algorithms using Python.",
        totalModules: 15,
        price: 2299,
        category: "Data Science",
        level: "Intermediate",
        duration: "10 weeks"
      },
      {
        title: "Mobile App Development with React Native",
        instructor: "Michael Chen",
        description: "Create cross-platform mobile applications for iOS and Android using React Native and JavaScript.",
        totalModules: 12,
        price: 1799,
        category: "Mobile Development",
        level: "Intermediate",
        duration: "8 weeks"
      }
    ];

    console.log('Inserting default courses...');
    for (const course of courses) {
      await run(
        `INSERT INTO courses (title, instructor, description, totalModules, price, category, level, duration) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          course.title,
          course.instructor,
          course.description,
          course.totalModules,
          course.price,
          course.category,
          course.level,
          course.duration
        ]
      );
    }

    // Create a demo user
    console.log('Creating demo user...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    await run(
      `INSERT INTO users (firstName, lastName, email, phone, password) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Demo', 'User', 'demo@techcareer.com', '555-123-4567', hashedPassword]
    );

    // Enroll demo user in first course
    await run(
      `INSERT INTO enrollments (user_id, course_id, completedModules, progress) 
       VALUES (?, ?, ?, ?)`,
      [1, 1, 7, 35]
    );

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await db.close();
  }
}

initializeDatabase();
