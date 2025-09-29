// Eratronics User Management System - JavaScript Implementation
class EratronicsApp {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.images = [];
        this.clicks = [];
        this.apiBase = '/api/data';
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.checkAuthentication();
    }

    // Data Management
    async loadData() {
        try {
            // Load current user from localStorage (for session persistence)
            const savedUser = localStorage.getItem('eratronics_current_user');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            }

            // Load all data from API
            const response = await fetch(this.apiBase);
            if (response.ok) {
                const data = await response.json();
                this.users = data.users || [];
                this.images = data.images || [];
                this.clicks = data.clicks || [];
                
                // If user is logged in, refresh the dashboard to show updated data
                if (this.currentUser) {
                    this.showDashboard();
                }
            } else {
                console.error('Failed to load data from API');
                this.showAlert('Failed to load data. Please refresh the page.', 'danger');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showAlert('Error loading data. Please check your connection.', 'danger');
        }
    }

    async saveData() {
        // Data is now saved via API calls, no need for localStorage
        // Keep current user in localStorage for session persistence
        if (this.currentUser) {
            localStorage.setItem('eratronics_current_user', JSON.stringify(this.currentUser));
        }
    }


    // Authentication
    hashPassword(password) {
        // Simple hash function for demo purposes
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.currentUser = result.user;
                    await this.saveData();
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('eratronics_current_user');
        this.showLogin();
    }

    checkAuthentication() {
        this.updateNavbar();
        if (this.currentUser) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (await this.login(username, password)) {
                this.showAlert('Login successful!', 'success');
                this.hideModal('loginModal');
                this.updateNavbar();
                this.showDashboard();
            } else {
                this.showAlert('Login unsuccessful. Please check username and password.', 'danger');
            }
        });

        // Login link - prevent opening modal if already logged in
        document.getElementById('loginLink').addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentUser) {
                // User is already logged in, don't show login modal
                return;
            }
            // Show login modal
            const modal = new bootstrap.Modal(document.getElementById('loginModal'));
            modal.show();
        });

        // Logout link
        document.getElementById('logoutLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Add user form
        document.getElementById('addUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addUser();
        });

        // Add image form
        document.getElementById('addImageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addImage();
        });

        // Upload Excel form
        document.getElementById('uploadExcelForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadExcel();
        });
    }

    // UI Management
    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        const alertId = 'alert-' + Date.now();
        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alertContainer.innerHTML = alertHtml;
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }

    hideModal(modalId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        if (modal) {
            modal.hide();
        }
    }

    showLogin() {
        this.updateNavbar();
        document.getElementById('mainContent').innerHTML = `
            <div class="row justify-content-center min-vh-100 align-items-center">
                <div class="col-md-6 col-lg-5">
                    <div class="login-container fade-in">
                        <div class="card-header text-center">
                            <div class="mb-3">
                                <i class="bi bi-shield-check text-white" style="font-size: 3rem;"></i>
                            </div>
                            <h4 class="mb-0 text-white fw-bold">Welcome Back</h4>
                            <p class="text-white-50 mb-0">Sign in to your account to continue</p>
                        </div>
                        <div class="card-body p-4">
                            <form id="loginForm">
                                <div class="mb-3">
                                    <label for="username" class="form-label">
                                        <i class="bi bi-person me-1"></i>Username
                                    </label>
                                    <input type="text" class="form-control form-control-lg" id="username" name="username" 
                                           placeholder="Enter your username" required>
                                </div>
                                <div class="mb-4">
                                    <label for="password" class="form-label">
                                        <i class="bi bi-lock me-1"></i>Password
                                    </label>
                                    <input type="password" class="form-control form-control-lg" id="password" name="password" 
                                           placeholder="Enter your password" required>
                                </div>
                                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">
                                    <i class="bi bi-box-arrow-in-right me-2"></i>
                                    Sign In
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Re-attach event listener
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (await this.login(username, password)) {
                this.showAlert('Login successful!', 'success');
                this.updateNavbar();
                this.showDashboard();
            } else {
                this.showAlert('Login unsuccessful. Please check username and password.', 'danger');
            }
        });
    }

    showDashboard() {
        this.updateNavbar();
        
        if (this.currentUser.user_type === 'admin') {
            this.showAdminDashboard();
        } else {
            this.showUserDashboard();
        }
    }

    showUserDashboard() {
        const availableImages = this.getAvailableImages();
        
        document.getElementById('mainContent').innerHTML = `
            <div class="row">
                <div class="col-12">
                    <!-- Welcome Header -->
                    <div class="dashboard-header fade-in">
                        <div class="d-flex align-items-center justify-content-center mb-3">
                            <div class="me-3">
                                <i class="bi bi-person-circle text-primary" style="font-size: 3rem;"></i>
                            </div>
                            <div class="text-center">
                                <h1 class="mb-1">Welcome, ${this.currentUser.username}</h1>
                                <div class="d-flex align-items-center justify-content-center gap-2">
                                    <span class="badge bg-primary fs-6">${this.currentUser.user_type.toUpperCase()}</span>
                                    <span class="text-muted">•</span>
                                    <span class="text-muted">${this.getAvailableImagesDescription()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Bar -->
                    <div class="row mb-4">
                        <div class="col-md-8">
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-outline-primary" onclick="app.selectAllImages()">
                                    <i class="bi bi-check-all me-1"></i>Select All
                                </button>
                                <button type="button" class="btn btn-outline-secondary" onclick="app.deselectAllImages()">
                                    <i class="bi bi-x-square me-1"></i>Deselect All
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 text-md-end">
                            <button type="button" class="btn btn-success btn-lg" id="confirmBtn" onclick="app.submitImageSelection()" disabled>
                                <i class="bi bi-check-circle me-2"></i>Confirm Selection (0)
                            </button>
                        </div>
                    </div>

                    <!-- Image Gallery -->
                    <div class="card fade-in">
                        <div class="card-header">
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-images text-primary me-2"></i>
                                    <h5 class="mb-0">Available Images</h5>
                                    <span class="badge bg-secondary ms-2">${availableImages.length} images</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-body p-4">
                            ${this.renderImageGrid(availableImages)}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="text-center mt-4">
                        <button class="btn btn-outline-secondary" onclick="app.logout()">
                            <i class="bi bi-box-arrow-right me-1"></i>Back to Login
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showAdminDashboard() {
        const stats = this.getStatistics();
        
        document.getElementById('mainContent').innerHTML = `
            <div class="row">
                <div class="col-12">
                    <!-- Admin Header -->
                    <div class="dashboard-header fade-in">
                        <div class="d-flex align-items-center justify-content-center mb-3">
                            <div class="me-3">
                                <i class="bi bi-shield-check text-primary" style="font-size: 3rem;"></i>
                            </div>
                            <div class="text-center">
                                <h1 class="mb-1">Admin Dashboard</h1>
                                <p class="lead mb-0">Welcome back, ${this.currentUser.username}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Statistics Cards -->
                    <div class="dashboard-stats fade-in">
                        <div class="stat-card">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-people text-primary me-2"></i>
                                <span class="stat-label">Total Users</span>
                            </div>
                            <div class="stat-number">${stats.summary.total_users}</div>
                        </div>
                        <div class="stat-card">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-images text-success me-2"></i>
                                <span class="stat-label">Total Images</span>
                            </div>
                            <div class="stat-number">${stats.summary.total_images}</div>
                        </div>
                        <div class="stat-card">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-mouse text-warning me-2"></i>
                                <span class="stat-label">Total Clicks</span>
                            </div>
                            <div class="stat-number">${stats.summary.total_clicks}</div>
                        </div>
                        <div class="stat-card">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-graph-up text-info me-2"></i>
                                <span class="stat-label">Avg Clicks/User</span>
                            </div>
                            <div class="stat-number">${stats.summary.avg_clicks_per_user.toFixed(1)}</div>
                        </div>
                    </div>

                    <!-- Admin Navigation -->
                    <div class="admin-nav fade-in">
                        <nav class="nav nav-pills justify-content-center">
                            <a class="nav-link active d-flex align-items-center" href="#" onclick="app.showAdminSection('users')">
                                <i class="bi bi-people me-2"></i>Users
                            </a>
                            <a class="nav-link d-flex align-items-center" href="#" onclick="app.showAdminSection('images')">
                                <i class="bi bi-images me-2"></i>Images
                            </a>
                            <a class="nav-link d-flex align-items-center" href="#" onclick="app.showAdminSection('statistics')">
                                <i class="bi bi-bar-chart me-2"></i>Statistics
                            </a>
                        </nav>
                    </div>

                    <!-- Admin Content -->
                    <div id="adminContent" class="fade-in">
                        ${this.renderAdminUsers()}
                    </div>
                </div>
            </div>
        `;
    }

    // Refresh admin dashboard data
    async refreshAdminData() {
        if (this.currentUser && this.currentUser.user_type === 'admin') {
            await this.loadData();
        }
    }

    showAdminSection(section) {
        // Update nav links
        document.querySelectorAll('.admin-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Find and activate the correct nav link
        const navLinks = document.querySelectorAll('.admin-nav .nav-link');
        navLinks.forEach(link => {
            if (link.textContent.trim().toLowerCase().includes(section)) {
                link.classList.add('active');
            }
        });

        // Show content with fade-in animation
        const adminContent = document.getElementById('adminContent');
        if (adminContent) {
            adminContent.style.opacity = '0';
            
            setTimeout(() => {
                switch(section) {
                    case 'users':
                        adminContent.innerHTML = this.renderAdminUsers();
                        break;
                    case 'images':
                        adminContent.innerHTML = this.renderAdminImages();
                        break;
                    case 'statistics':
                        adminContent.innerHTML = this.renderAdminStatistics();
                        break;
                }
                adminContent.style.opacity = '1';
            }, 150);
        }
    }

    // Image Management
    getAvailableImages() {
        const categoryMapping = {
            'a': ['basic'],
            'b': ['basic', 'intermediate'],
            'c': ['basic', 'intermediate', 'advanced']
        };
        
        const allowedCategories = categoryMapping[this.currentUser.user_type] || ['basic', 'intermediate', 'advanced'];
        return this.images.filter(img => allowedCategories.includes(img.category))
                         .sort((a, b) => (a.category + a.name).localeCompare(b.category + b.name));
    }

    getAvailableImagesDescription() {
        const categoryMapping = {
            'a': 'Available: 7 Basic images',
            'b': 'Available: 7 Basic + 7 Intermediate images (14 total)',
            'c': 'Available: All 21 images (7 Basic + 7 Intermediate + 7 Advanced)'
        };
        return categoryMapping[this.currentUser.user_type] || 'Available: All images';
    }

    renderImageGrid(images) {
        if (images.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="bi bi-image text-muted" style="font-size: 4rem;"></i>
                    <h5 class="text-muted mt-3">No images available</h5>
                    <p class="text-muted">No images are available for your experience level.</p>
                </div>
            `;
        }

        return `
            <div class="image-grid">
                ${images.map(image => `
                    <div class="image-item" data-image-id="${image.id}">
                        <div class="image-item-header">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input image-checkbox" 
                                       value="${image.id}" id="image-${image.id}" 
                                       onchange="app.toggleImageSelection(this)">
                                <label class="form-check-label fw-semibold" for="image-${image.id}">
                                    ${image.name}
                                </label>
                            </div>
                        </div>
                        <div class="image-item-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge ${this.getCategoryBadgeClass(image.category)} fs-6">
                                    <i class="bi bi-tag me-1"></i>${image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                                </span>
                            </div>
                            <div class="image-preview position-relative">
                                <img src="static/thumbnails/${image.filename}" 
                                     alt="${image.name}" 
                                     class="clickable-image w-100"
                                     data-full-image="static/uploads/${image.filename}"
                                     data-image-name="${image.name}"
                                     data-image-category="${image.category}"
                                     onclick="app.openImagePreview(this)"
                                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjY1JSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='">
                                <div class="image-overlay">
                                    <i class="bi bi-eye text-white"></i>
                                </div>
                            </div>
                            <div class="mt-3 text-center">
                                <button class="btn btn-outline-primary btn-sm w-100" 
                                        onclick="app.openImagePreview(this.closest('.image-item').querySelector('img'))">
                                    <i class="bi bi-eye me-1"></i>Preview Image
                                </button>
                            </div>
                        </div>
                        <div class="image-item-footer">
                            <small class="text-muted d-flex align-items-center justify-content-center">
                                <i class="bi bi-check-square me-1"></i>Select to choose • 
                                <i class="bi bi-eye me-1"></i>Click image or button to preview
                            </small>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getCategoryBadgeClass(category) {
        const classes = {
            'basic': 'bg-primary',
            'intermediate': 'bg-warning',
            'advanced': 'bg-danger'
        };
        return classes[category] || 'bg-secondary';
    }

    toggleImageSelection(checkbox) {
        const imageItem = checkbox.closest('.image-item');
        if (checkbox.checked) {
            imageItem.classList.add('selected');
        } else {
            imageItem.classList.remove('selected');
        }
        this.updateSelectionCount();
    }

    updateSelectionCount() {
        const selectedCount = document.querySelectorAll('.image-checkbox:checked').length;
        const confirmBtn = document.getElementById('confirmBtn');
        if (confirmBtn) {
            confirmBtn.textContent = `Confirm Selection (${selectedCount})`;
            confirmBtn.disabled = selectedCount === 0;
        }
    }

    selectAllImages() {
        document.querySelectorAll('.image-checkbox').forEach(checkbox => {
            checkbox.checked = true;
            this.toggleImageSelection(checkbox);
        });
    }

    deselectAllImages() {
        document.querySelectorAll('.image-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            this.toggleImageSelection(checkbox);
        });
    }

    async submitImageSelection() {
        const selectedImages = Array.from(document.querySelectorAll('.image-checkbox:checked'))
                                   .map(cb => parseInt(cb.value));
        
        if (selectedImages.length === 0) {
            this.showAlert('Please select at least one image.', 'warning');
            return;
        }

        if (confirm(`Are you sure you want to select ${selectedImages.length} image(s)?`)) {
            try {
                // Add all clicks in parallel
                await Promise.all(selectedImages.map(imageId => 
                    this.addClick(this.currentUser.id, imageId)
                ));
                this.showAlert(`Successfully selected ${selectedImages.length} image(s)!`, 'success');
                this.deselectAllImages();
                
                // Refresh data to get updated click counts
                await this.loadData();
            } catch (error) {
                console.error('Error submitting image selection:', error);
                this.showAlert('Error submitting selection. Please try again.', 'danger');
            }
        }
    }

    openImagePreview(imgElement) {
        const fullImageSrc = imgElement.getAttribute('data-full-image');
        const imageName = imgElement.getAttribute('data-image-name');
        const imageCategory = imgElement.getAttribute('data-image-category');
        
        document.getElementById('previewImage').src = fullImageSrc;
        document.getElementById('previewImageName').textContent = imageName;
        
        const categoryBadge = document.getElementById('previewImageCategory');
        categoryBadge.textContent = imageCategory.charAt(0).toUpperCase() + imageCategory.slice(1);
        categoryBadge.className = 'badge ' + this.getCategoryBadgeClass(imageCategory);
        
        const modal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
        modal.show();
    }

    openImagePreviewFromAdmin(filename, imageName, imageCategory) {
        const fullImageSrc = `static/uploads/${filename}`;
        
        document.getElementById('previewImage').src = fullImageSrc;
        document.getElementById('previewImageName').textContent = imageName;
        
        const categoryBadge = document.getElementById('previewImageCategory');
        categoryBadge.textContent = imageCategory.charAt(0).toUpperCase() + imageCategory.slice(1);
        categoryBadge.className = 'badge ' + this.getCategoryBadgeClass(imageCategory);
        
        const modal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
        modal.show();
    }

    // Admin Functions
    renderAdminUsers() {
        const users = this.users.filter(u => u.user_type !== 'admin').sort((a, b) => a.username.localeCompare(b.username));
        
        return `
            <div class="card fade-in">
                <div class="card-header">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-people text-primary me-2"></i>
                            <h5 class="mb-0">User Management</h5>
                            <span class="badge bg-secondary ms-2">${users.length} users</span>
                        </div>
                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal">
                                <i class="bi bi-person-plus me-1"></i>Add User
                            </button>
                            <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#uploadExcelModal">
                                <i class="bi bi-file-earmark-excel me-1"></i>Upload Excel
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th class="border-0">
                                        <i class="bi bi-person me-1"></i>Username
                                    </th>
                                    <th class="border-0">
                                        <i class="bi bi-shield me-1"></i>User Type
                                    </th>
                                    <th class="border-0">
                                        <i class="bi bi-calendar me-1"></i>Created
                                    </th>
                                    <th class="border-0">
                                        <i class="bi bi-gear me-1"></i>Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map(user => `
                                    <tr>
                                        <td class="fw-semibold">${user.username}</td>
                                        <td>
                                            <span class="badge ${this.getCategoryBadgeClass(user.user_type)} fs-6">
                                                ${user.user_type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td class="text-muted">${new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button class="btn btn-outline-danger btn-sm" onclick="app.deleteUser(${user.id})">
                                                <i class="bi bi-trash me-1"></i>Delete
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    renderAdminImages() {
        const images = this.images.sort((a, b) => (a.category + a.name).localeCompare(b.category + b.name));
        
        return `
            <div class="card fade-in">
                <div class="card-header">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-images text-primary me-2"></i>
                            <h5 class="mb-0">Image Management</h5>
                            <span class="badge bg-secondary ms-2">${images.length} images</span>
                        </div>
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addImageModal">
                            <i class="bi bi-plus-circle me-1"></i>Add Image
                        </button>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th class="border-0">
                                        <i class="bi bi-tag me-1"></i>Name
                                    </th>
                                    <th class="border-0">
                                        <i class="bi bi-collection me-1"></i>Category
                                    </th>
                                    <th class="border-0">
                                        <i class="bi bi-file-image me-1"></i>Filename
                                    </th>
                                    <th class="border-0">
                                        <i class="bi bi-calendar me-1"></i>Created
                                    </th>
                                    <th class="border-0">
                                        <i class="bi bi-gear me-1"></i>Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                ${images.map(image => `
                                    <tr>
                                        <td class="fw-semibold">${image.name}</td>
                                        <td>
                                            <span class="badge ${this.getCategoryBadgeClass(image.category)} fs-6">
                                                <i class="bi bi-tag me-1"></i>${image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                                            </span>
                                        </td>
                                        <td class="text-muted font-monospace">${image.filename}</td>
                                        <td class="text-muted">${new Date(image.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div class="d-flex gap-1">
                                                <button class="btn btn-outline-primary btn-sm" 
                                                        onclick="app.openImagePreviewFromAdmin('${image.filename}', '${image.name}', '${image.category}')">
                                                    <i class="bi bi-eye me-1"></i>Preview
                                                </button>
                                                <button class="btn btn-outline-danger btn-sm" onclick="app.deleteImage(${image.id})">
                                                    <i class="bi bi-trash me-1"></i>Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    renderAdminStatistics() {
        const stats = this.getStatistics();
        
        return `
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <i class="bi bi-people text-primary mb-2" style="font-size: 2rem;"></i>
                            <h5 class="card-title">Active Users</h5>
                            <p class="card-text fs-4 fw-bold text-primary">${stats.summary.total_users}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <i class="bi bi-mouse text-success mb-2" style="font-size: 2rem;"></i>
                            <h5 class="card-title">Total Clicks</h5>
                            <p class="card-text fs-4 fw-bold text-success">${stats.summary.total_clicks}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <i class="bi bi-graph-up text-info mb-2" style="font-size: 2rem;"></i>
                            <h5 class="card-title">Avg Clicks/User</h5>
                            <p class="card-text fs-4 fw-bold text-info">${stats.summary.avg_clicks_per_user.toFixed(1)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card fade-in">
                <div class="card-header">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-bar-chart text-primary me-2"></i>
                        <h5 class="mb-0">Detailed Click Statistics</h5>
                        <span class="badge bg-secondary ms-2">${stats.stats.length} records</span>
                    </div>
                </div>
                <div class="card-body p-0">
                    ${stats.stats.length === 0 ? `
                        <div class="text-center py-5">
                            <i class="bi bi-bar-chart text-muted" style="font-size: 4rem;"></i>
                            <h5 class="text-muted mt-3">No Click Data Yet</h5>
                            <p class="text-muted">Click statistics will appear here once users start selecting images.</p>
                            <div class="mt-3">
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Users need to select images to generate click data
                                </small>
                            </div>
                        </div>
                    ` : `
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th class="border-0">
                                            <i class="bi bi-person me-1"></i>User
                                        </th>
                                        <th class="border-0">
                                            <i class="bi bi-image me-1"></i>Image
                                        </th>
                                        <th class="border-0">
                                            <i class="bi bi-collection me-1"></i>Category
                                        </th>
                                        <th class="border-0">
                                            <i class="bi bi-mouse me-1"></i>Clicks
                                        </th>
                                        <th class="border-0">
                                            <i class="bi bi-clock me-1"></i>Last Click
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.stats.slice(0, 20).map(stat => `
                                        <tr>
                                            <td class="fw-semibold">${stat.username}</td>
                                            <td>${stat.image_name}</td>
                                            <td>
                                                <span class="badge ${this.getCategoryBadgeClass(stat.category)} fs-6">
                                                    <i class="bi bi-tag me-1"></i>${stat.category.charAt(0).toUpperCase() + stat.category.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge bg-info fs-6">${stat.click_count}</span>
                                            </td>
                                            <td class="text-muted">${new Date(stat.last_clicked).toLocaleDateString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        ${stats.stats.length > 20 ? `
                            <div class="card-footer text-center">
                                <small class="text-muted">Showing first 20 records of ${stats.stats.length} total</small>
                            </div>
                        ` : ''}
                    `}
                </div>
            </div>
        `;
    }

    // Data Operations
    async addUser() {
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const userType = document.getElementById('newUserType').value;

        try {
            const response = await fetch(`${this.apiBase}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, user_type: userType })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.users.push(result.user);
                    this.showAlert('User added successfully!', 'success');
                    this.hideModal('addUserModal');
                    document.getElementById('addUserForm').reset();
                    this.showAdminSection('users');
                } else {
                    this.showAlert(result.message || 'Failed to add user', 'danger');
                }
            } else {
                const error = await response.json();
                this.showAlert(error.message || 'Failed to add user', 'danger');
            }
        } catch (error) {
            console.error('Add user error:', error);
            this.showAlert('Error adding user. Please try again.', 'danger');
        }
    }

    async deleteUser(userId) {
        if (userId === this.currentUser.id) {
            this.showAlert('You cannot delete your own account.', 'danger');
            return;
        }

        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`${this.apiBase}/users/${userId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.users = this.users.filter(u => u.id !== userId);
                        this.clicks = this.clicks.filter(c => c.user_id !== userId);
                        this.showAlert('User deleted successfully!', 'success');
                        this.showAdminSection('users');
                    } else {
                        this.showAlert(result.message || 'Failed to delete user', 'danger');
                    }
                } else {
                    const error = await response.json();
                    this.showAlert(error.message || 'Failed to delete user', 'danger');
                }
            } catch (error) {
                console.error('Delete user error:', error);
                this.showAlert('Error deleting user. Please try again.', 'danger');
            }
        }
    }

    async addImage() {
        const name = document.getElementById('imageName').value;
        const category = document.getElementById('imageCategory').value;
        const fileInput = document.getElementById('imageFile');

        if (!fileInput.files[0]) {
            this.showAlert('Please select an image file', 'danger');
            return;
        }

        const file = fileInput.files[0];
        const filename = file.name;

        // Create a preview URL for the uploaded image
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const imageData = e.target.result;
                
                const response = await fetch(`${this.apiBase}/images`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        name, 
                        category, 
                        filename, 
                        imageData 
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.images.push(result.image);
                        this.showAlert('Image added successfully!', 'success');
                        this.hideModal('addImageModal');
                        document.getElementById('addImageForm').reset();
                        this.showAdminSection('images');
                    } else {
                        this.showAlert(result.message || 'Failed to add image', 'danger');
                    }
                } else {
                    const error = await response.json();
                    this.showAlert(error.message || 'Failed to add image', 'danger');
                }
            } catch (error) {
                console.error('Add image error:', error);
                this.showAlert('Error adding image. Please try again.', 'danger');
            }
        };
        reader.readAsDataURL(file);
    }

    async deleteImage(imageId) {
        if (confirm('Are you sure you want to delete this image?')) {
            try {
                const response = await fetch(`${this.apiBase}/images/${imageId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.images = this.images.filter(i => i.id !== imageId);
                        this.clicks = this.clicks.filter(c => c.image_id !== imageId);
                        this.showAlert('Image deleted successfully!', 'success');
                        this.showAdminSection('images');
                    } else {
                        this.showAlert(result.message || 'Failed to delete image', 'danger');
                    }
                } else {
                    const error = await response.json();
                    this.showAlert(error.message || 'Failed to delete image', 'danger');
                }
            } catch (error) {
                console.error('Delete image error:', error);
                this.showAlert('Error deleting image. Please try again.', 'danger');
            }
        }
    }

    async addClick(userId, imageId) {
        try {
            const response = await fetch(`${this.apiBase}/clicks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, image_id: imageId })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.clicks.push(result.click);
                }
            }
        } catch (error) {
            console.error('Add click error:', error);
        }
    }

    getStatistics() {
        const nonAdminUsers = this.users.filter(u => u.user_type !== 'admin');
        
        // Group clicks by user and image
        const clickGroups = {};
        this.clicks.forEach(click => {
            const user = this.users.find(u => u.id === click.user_id);
            const image = this.images.find(i => i.id === click.image_id);
            
            if (user && image && user.user_type !== 'admin') {
                const key = `${user.id}-${image.id}`;
                if (!clickGroups[key]) {
                    clickGroups[key] = {
                        username: user.username,
                        user_type: user.user_type,
                        image_name: image.name,
                        category: image.category,
                        click_count: 0,
                        last_clicked: click.clicked_at
                    };
                }
                clickGroups[key].click_count++;
                if (click.clicked_at > clickGroups[key].last_clicked) {
                    clickGroups[key].last_clicked = click.clicked_at;
                }
            }
        });

        const stats = Object.values(clickGroups).sort((a, b) => (a.username + b.image_name).localeCompare(b.username + a.image_name));
        
        const summary = {
            total_users: nonAdminUsers.length,
            total_clicks: this.clicks.filter(c => {
                const user = this.users.find(u => u.id === c.user_id);
                return user && user.user_type !== 'admin';
            }).length,
            total_images: this.images.length,
            avg_clicks_per_user: nonAdminUsers.length > 0 ? 
                this.clicks.filter(c => {
                    const user = this.users.find(u => u.id === c.user_id);
                    return user && user.user_type !== 'admin';
                }).length / nonAdminUsers.length : 0
        };

        return { stats, summary };
    }

    async uploadExcel() {
        const fileInput = document.getElementById('excelFile');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showAlert('Please select an Excel file', 'danger');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    this.showAlert('No data found in Excel file', 'warning');
                    return;
                }

                // Check required columns
                const requiredColumns = ['username', 'password', 'user_type'];
                const missingColumns = requiredColumns.filter(col => !jsonData[0].hasOwnProperty(col));
                
                if (missingColumns.length > 0) {
                    this.showAlert(`Missing required columns: ${missingColumns.join(', ')}`, 'danger');
                    return;
                }

                // Process and validate data
                const users = [];
                const errors = [];

                jsonData.forEach((row, index) => {
                    try {
                        const username = String(row.username).trim();
                        const password = String(row.password).trim();
                        const userType = String(row.user_type).trim().toLowerCase();

                        if (!username || !password) {
                            errors.push(`Row ${index + 2}: Username and password cannot be empty`);
                            return;
                        }

                        if (!['admin', 'a', 'b', 'c'].includes(userType)) {
                            errors.push(`Row ${index + 2}: Invalid user_type '${userType}'. Must be admin, A, B, or C`);
                            return;
                        }

                        users.push({ username, password, user_type: userType });
                    } catch (error) {
                        errors.push(`Row ${index + 2}: ${error.message}`);
                    }
                });

                if (errors.length > 0) {
                    const errorMsg = errors.slice(0, 5).join('; ');
                    const moreErrors = errors.length > 5 ? ` ... and ${errors.length - 5} more errors` : '';
                    this.showAlert(`Validation errors: ${errorMsg}${moreErrors}`, 'warning');
                    return;
                }

                // Send to API
                const response = await fetch(`${this.apiBase}/users/bulk`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ users })
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        // Reload data to get updated user list
                        await this.loadData();
                        
                        if (result.successCount > 0) {
                            this.showAlert(`Successfully created ${result.successCount} user(s) from Excel file!`, 'success');
                        }

                        if (result.errorCount > 0) {
                            const errorMsg = result.errors.slice(0, 5).join('; ');
                            const moreErrors = result.errors.length > 5 ? ` ... and ${result.errors.length - 5} more errors` : '';
                            this.showAlert(`Failed to create ${result.errorCount} user(s). Errors: ${errorMsg}${moreErrors}`, 'warning');
                        }

                        this.hideModal('uploadExcelModal');
                        document.getElementById('uploadExcelForm').reset();
                        this.showAdminSection('users');
                    } else {
                        this.showAlert(result.message || 'Failed to upload Excel file', 'danger');
                    }
                } else {
                    const error = await response.json();
                    this.showAlert(error.message || 'Failed to upload Excel file', 'danger');
                }

            } catch (error) {
                console.error('Upload Excel error:', error);
                this.showAlert(`Error processing Excel file: ${error.message}`, 'danger');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    updateNavbar() {
        const userInfo = document.getElementById('userInfo');
        const loginLink = document.getElementById('loginLink');
        const logoutLink = document.getElementById('logoutLink');
        const navbarBrand = document.getElementById('navbarBrand');

        console.log('updateNavbar called, currentUser:', this.currentUser);

        if (this.currentUser) {
            // User is logged in - show user info and logout, hide login
            console.log('User is logged in, hiding login link');
            if (userInfo) {
                userInfo.style.display = 'block';
                userInfo.classList.remove('hidden');
            }
            if (loginLink) {
                loginLink.style.display = 'none';
                loginLink.classList.add('hidden');
            }
            if (logoutLink) {
                logoutLink.style.display = 'block';
                logoutLink.classList.remove('hidden');
            }
            const userTypeElement = document.getElementById('currentUserType');
            if (userTypeElement) userTypeElement.textContent = this.currentUser.user_type;
            if (navbarBrand) navbarBrand.textContent = 'Eratronics User Management';
        } else {
            // User is not logged in - show login, hide user info and logout
            console.log('User is not logged in, showing login link');
            if (userInfo) {
                userInfo.style.display = 'none';
                userInfo.classList.add('hidden');
            }
            if (loginLink) {
                loginLink.style.display = 'block';
                loginLink.classList.remove('hidden');
            }
            if (logoutLink) {
                logoutLink.style.display = 'none';
                logoutLink.classList.add('hidden');
            }
            if (navbarBrand) navbarBrand.textContent = 'Eratronics User Management';
        }
    }
}

// Initialize the application
const app = new EratronicsApp();
