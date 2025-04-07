const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { get, all, run } = require('./db');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;
    
    // Basic validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      console.log('Missing required fields:', { firstName: !!firstName, lastName: !!lastName, email: !!email, password: !!password, confirmPassword: !!confirmPassword });
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    
    // Check if user already exists - FIXED
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
      const result = await get(query, [email]);
      console.log('Existing user check result:', result);
      
      if (result && result.count > 0) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
    } catch (dbError) {
      console.error('Database error when checking existing user:', dbError);
      return res.status(500).json({ success: false, message: 'Error checking existing user', error: dbError.message });
    }
    
    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (bcryptError) {
      console.error('Password hashing error:', bcryptError);
      return res.status(500).json({ success: false, message: 'Error hashing password', error: bcryptError.message });
    }
    
    // Format phone (ensure it's null if empty)
    const formattedPhone = phone && phone.trim() !== '' ? phone : null;
    
    // Insert new user - FIXED with better error handling
    try {
      console.log('Attempting to insert new user:', { firstName, lastName, email, phone: formattedPhone });
      const insertQuery = 'INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)';
      const result = await run(insertQuery, [firstName, lastName, email, formattedPhone, hashedPassword]);
      
      console.log('User registered successfully:', result);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        userId: result.lastID
      });
    } catch (insertError) {
      console.error('Database insert error:', insertError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error creating user account', 
        error: insertError.message
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Find user
    let user;
    try {
      user = await get('SELECT * FROM users WHERE email = ?', [email]);
      console.log('User found:', user ? 'Yes' : 'No');
    } catch (dbError) {
      console.error('Database error when finding user:', dbError);
      return res.status(500).json({ success: false, message: 'Database error during login' });
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return res.status(500).json({ success: false, message: 'Error verifying password' });
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Get enrolled courses
    let enrollments = [];
    try {
      enrollments = await all(
        `SELECT course_id FROM enrollments WHERE user_id = ?`,
        [user.id]
      );
    } catch (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError);
      // Continue with login even if enrollments can't be fetched
      enrollments = [];
    }
    
    const courseIds = enrollments.map(enrollment => enrollment.course_id);
    
    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      user: { 
        id: user.id, 
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || null,
        enrolledCourses: courseIds
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get user's courses
app.get('/api/user/:userId/courses', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Check if user exists
    const user = await get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get user's enrolled courses with enrollment details
    const enrolledCourses = await all(`
      SELECT c.*, e.completedModules, e.progress
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = ?
    `, [userId]);
    
    res.status(200).json({ 
      success: true,
      courses: enrolledCourses
    });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching courses' });
  }
});

// Get all available courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await all('SELECT * FROM courses');
    res.status(200).json({ 
      success: true,
      courses: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching courses' });
  }
});

// Purchase a course
app.post('/api/purchase', async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
    if (!userId || !courseId) {
      return res.status(400).json({ success: false, message: 'User ID and Course ID are required' });
    }
    
    // Check if user exists
    const user = await get('SELECT * FROM users WHERE id = ?', [parseInt(userId)]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if course exists
    const course = await get('SELECT * FROM courses WHERE id = ?', [parseInt(courseId)]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Check if already purchased
    const existingEnrollment = await get(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', 
      [parseInt(userId), parseInt(courseId)]
    );
    
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Course already purchased' });
    }
    
    // Add enrollment
    await run(
      'INSERT INTO enrollments (user_id, course_id, completedModules, progress) VALUES (?, ?, ?, ?)',
      [parseInt(userId), parseInt(courseId), 0, 0]
    );
    
    res.status(200).json({
      success: true,
      message: 'Course purchased successfully',
      course: {
        id: course.id,
        title: course.title,
        instructor: course.instructor,
        totalModules: course.totalModules,
        completedModules: 0,
        progress: 0
      }
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ success: false, message: 'Server error during purchase' });
  }
});

// Update course progress
app.put('/api/user/:userId/course/:courseId/progress', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const courseId = parseInt(req.params.courseId);
    const { completedModules, progress } = req.body;
    
    // Update enrollment
    await run(
      `UPDATE enrollments SET completedModules = ?, progress = ? 
       WHERE user_id = ? AND course_id = ?`,
      [completedModules, progress, userId, courseId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, message: 'Server error during progress update' });
  }
});

// Update user profile
app.put('/api/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { firstName, lastName, phone } = req.body;
    
    // Update user
    await run(
      `UPDATE users SET firstName = ?, lastName = ?, phone = ? WHERE id = ?`,
      [firstName, lastName, phone, userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        firstName,
        lastName,
        phone
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile update' });
  }
});

// Change password
app.put('/api/user/:userId/password', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = await get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await run(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: 'Server error during password change' });
  }
});

// Get all users (admin only - for debugging)
app.get('/api/users', async (req, res) => {
  try {
    // In a real app, this would require admin authentication
    const users = await all('SELECT id, firstName, lastName, email, phone FROM users');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching users' });
  }
});

// Route all other GET requests to index.html for SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Frontend available at http://localhost:${port}/index.html`);
});
