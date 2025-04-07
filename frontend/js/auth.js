document.addEventListener('DOMContentLoaded', function() {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('loginError');
            
            // Simple validation
            if (!email || !password) {
                showError(errorDiv, 'Please enter both email and password');
                return;
            }
            
            // Call login API
            fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store user data in localStorage
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Redirect to dashboard or home
                    window.location.href = 'index.html';
                } else {
                    showError(errorDiv, data.message || 'Login failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError(errorDiv, 'An error occurred. Please try again later.');
            });
        });
    }
    
    // Handle signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorDiv = document.getElementById('signupError');
            
            // Simple validation
            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
                showError(errorDiv, 'All fields are required');
                return;
            }
            
            if (password !== confirmPassword) {
                showError(errorDiv, 'Passwords do not match');
                return;
            }
            
            // Call register API
            fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phone,
                    password,
                    confirmPassword
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store user data in localStorage
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Redirect to login page with success message
                    window.location.href = 'login.html?registered=true';
                } else {
                    showError(errorDiv, data.message || 'Registration failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError(errorDiv, 'An error occurred. Please try again later.');
            });
        });
    }
    
    // Check if user is logged in
    function checkAuth() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
            // User is logged in
            const accountLinks = document.querySelectorAll('.nav-item.dropdown');
            accountLinks.forEach(link => {
                const dropdown = link.querySelector('.dropdown-toggle');
                if (dropdown) {
                    dropdown.textContent = `Hello, ${user.firstName}`;
                    
                    const menu = link.querySelector('.dropdown-menu');
                    if (menu) {
                        menu.innerHTML = `
                            <li><a class="dropdown-item" href="profile.html">Profile</a></li>
                            <li><a class="dropdown-item" href="my-courses.html">My Courses</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" id="logout">Logout</a></li>
                        `;
                    }
                }
            });
            
            // Add logout functionality
            const logoutBtn = document.getElementById('logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('user');
                    window.location.href = 'index.html';
                });
            }
        }
    }
    
    // Show registration success message
    function showRegisterSuccess() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('registered') === 'true') {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                const successDiv = document.createElement('div');
                successDiv.className = 'alert alert-success';
                successDiv.textContent = 'Registration successful! Please login with your credentials.';
                loginForm.parentNode.insertBefore(successDiv, loginForm);
            }
        }
    }
    
    // Helper for showing errors
    function showError(element, message) {
        element.textContent = message;
        element.classList.remove('d-none');
        setTimeout(() => {
            element.classList.add('d-none');
        }, 5000);
    }
    
    // Run auth check
    checkAuth();
    showRegisterSuccess();
});
