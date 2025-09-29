<?php
// API endpoint for data management
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// In-memory storage (in production, you'd use a database)
$dataStore = [
    'users' => [],
    'images' => [],
    'clicks' => [],
    'nextUserId' => 1,
    'nextImageId' => 1,
    'nextClickId' => 1
];

// Initialize default data if empty
function initializeDefaultData() {
    global $dataStore;
    
    if (empty($dataStore['users'])) {
        $dataStore['users'] = [
            [
                'id' => 1,
                'username' => 'admin',
                'password' => hashPassword('admin123'),
                'user_type' => 'admin',
                'created_at' => date('c')
            ],
            [
                'id' => 2,
                'username' => 'user_a',
                'password' => hashPassword('passworda'),
                'user_type' => 'a',
                'created_at' => date('c')
            ],
            [
                'id' => 3,
                'username' => 'user_b',
                'password' => hashPassword('passwordb'),
                'user_type' => 'b',
                'created_at' => date('c')
            ],
            [
                'id' => 4,
                'username' => 'user_c',
                'password' => hashPassword('passwordc'),
                'user_type' => 'c',
                'created_at' => date('c')
            ]
        ];
        $dataStore['nextUserId'] = 5;

        // Default images
        $dataStore['images'] = [
            // Basic images (7)
            ['id' => 1, 'name' => 'Nature 1', 'filename' => 'basic1.jpg', 'category' => 'basic', 'created_at' => date('c')],
            ['id' => 2, 'name' => 'Nature 2', 'filename' => 'basic2.jpg', 'category' => 'basic', 'created_at' => date('c')],
            ['id' => 3, 'name' => 'Nature 3', 'filename' => 'basic3.jpg', 'category' => 'basic', 'created_at' => date('c')],
            ['id' => 4, 'name' => 'Nature 4', 'filename' => 'basic4.jpg', 'category' => 'basic', 'created_at' => date('c')],
            ['id' => 5, 'name' => 'Nature 5', 'filename' => 'basic5.jpg', 'category' => 'basic', 'created_at' => date('c')],
            ['id' => 6, 'name' => 'Nature 6', 'filename' => 'basic6.jpg', 'category' => 'basic', 'created_at' => date('c')],
            ['id' => 7, 'name' => 'Nature 7', 'filename' => 'basic7.jpg', 'category' => 'basic', 'created_at' => date('c')],
            // Intermediate images (7)
            ['id' => 8, 'name' => 'City 1', 'filename' => 'intermediate1.jpg', 'category' => 'intermediate', 'created_at' => date('c')],
            ['id' => 9, 'name' => 'City 2', 'filename' => 'intermediate2.jpg', 'category' => 'intermediate', 'created_at' => date('c')],
            ['id' => 10, 'name' => 'City 3', 'filename' => 'intermediate3.jpg', 'category' => 'intermediate', 'created_at' => date('c')],
            ['id' => 11, 'name' => 'City 4', 'filename' => 'intermediate4.jpg', 'category' => 'intermediate', 'created_at' => date('c')],
            ['id' => 12, 'name' => 'City 5', 'filename' => 'intermediate5.jpg', 'category' => 'intermediate', 'created_at' => date('c')],
            ['id' => 13, 'name' => 'City 6', 'filename' => 'intermediate6.jpg', 'category' => 'intermediate', 'created_at' => date('c')],
            ['id' => 14, 'name' => 'City 7', 'filename' => 'intermediate7.jpg', 'category' => 'intermediate', 'created_at' => date('c')],
            // Advanced images (7)
            ['id' => 15, 'name' => 'Abstract 1', 'filename' => 'advanced1.jpg', 'category' => 'advanced', 'created_at' => date('c')],
            ['id' => 16, 'name' => 'Abstract 2', 'filename' => 'advanced2.jpg', 'category' => 'advanced', 'created_at' => date('c')],
            ['id' => 17, 'name' => 'Abstract 3', 'filename' => 'advanced3.jpg', 'category' => 'advanced', 'created_at' => date('c')],
            ['id' => 18, 'name' => 'Abstract 4', 'filename' => 'advanced4.jpg', 'category' => 'advanced', 'created_at' => date('c')],
            ['id' => 19, 'name' => 'Abstract 5', 'filename' => 'advanced5.jpg', 'category' => 'advanced', 'created_at' => date('c')],
            ['id' => 20, 'name' => 'Abstract 6', 'filename' => 'advanced6.jpg', 'category' => 'advanced', 'created_at' => date('c')],
            ['id' => 21, 'name' => 'Abstract 7', 'filename' => 'advanced7.jpg', 'category' => 'advanced', 'created_at' => date('c')]
        ];
        $dataStore['nextImageId'] = 22;
    }
}

function hashPassword($password) {
    return hash('sha256', $password);
}

function verifyPassword($password, $hash) {
    return hashPassword($password) === $hash;
}

function getStatistics() {
    global $dataStore;
    
    $nonAdminUsers = array_filter($dataStore['users'], function($user) {
        return $user['user_type'] !== 'admin';
    });
    
    // Group clicks by user and image
    $clickGroups = [];
    foreach ($dataStore['clicks'] as $click) {
        $user = null;
        $image = null;
        
        foreach ($dataStore['users'] as $u) {
            if ($u['id'] === $click['user_id']) {
                $user = $u;
                break;
            }
        }
        
        foreach ($dataStore['images'] as $i) {
            if ($i['id'] === $click['image_id']) {
                $image = $i;
                break;
            }
        }
        
        if ($user && $image && $user['user_type'] !== 'admin') {
            $key = $user['id'] . '-' . $image['id'];
            if (!isset($clickGroups[$key])) {
                $clickGroups[$key] = [
                    'username' => $user['username'],
                    'user_type' => $user['user_type'],
                    'image_name' => $image['name'],
                    'category' => $image['category'],
                    'click_count' => 0,
                    'last_clicked' => $click['clicked_at']
                ];
            }
            $clickGroups[$key]['click_count']++;
            if ($click['clicked_at'] > $clickGroups[$key]['last_clicked']) {
                $clickGroups[$key]['last_clicked'] = $click['clicked_at'];
            }
        }
    }
    
    $stats = array_values($clickGroups);
    usort($stats, function($a, $b) {
        return strcmp($a['username'] . $b['image_name'], $b['username'] . $a['image_name']);
    });
    
    $adminClicks = array_filter($dataStore['clicks'], function($click) use ($dataStore) {
        foreach ($dataStore['users'] as $user) {
            if ($user['id'] === $click['user_id']) {
                return $user['user_type'] !== 'admin';
            }
        }
        return false;
    });
    
    $summary = [
        'total_users' => count($nonAdminUsers),
        'total_clicks' => count($adminClicks),
        'total_images' => count($dataStore['images']),
        'avg_clicks_per_user' => count($nonAdminUsers) > 0 ? count($adminClicks) / count($nonAdminUsers) : 0
    ];
    
    return ['stats' => $stats, 'summary' => $summary];
}

// Initialize data
initializeDefaultData();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/data', '', $path);

try {
    switch ($method) {
        case 'GET':
            if ($path === '/users') {
                echo json_encode($dataStore['users']);
            } elseif ($path === '/images') {
                echo json_encode($dataStore['images']);
            } elseif ($path === '/clicks') {
                echo json_encode($dataStore['clicks']);
            } elseif ($path === '/stats') {
                echo json_encode(getStatistics());
            } else {
                echo json_encode([
                    'users' => $dataStore['users'],
                    'images' => $dataStore['images'],
                    'clicks' => $dataStore['clicks']
                ]);
            }
            break;

        case 'POST':
            $body = json_decode(file_get_contents('php://input'), true);
            
            if ($path === '/login') {
                $username = $body['username'];
                $password = $body['password'];
                
                $user = null;
                foreach ($dataStore['users'] as $u) {
                    if ($u['username'] === $username) {
                        $user = $u;
                        break;
                    }
                }
                
                if ($user && verifyPassword($password, $user['password'])) {
                    echo json_encode([
                        'success' => true,
                        'user' => [
                            'id' => $user['id'],
                            'username' => $user['username'],
                            'user_type' => $user['user_type']
                        ]
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
                }
            } elseif ($path === '/users') {
                $username = $body['username'];
                $password = $body['password'];
                $userType = $body['user_type'];
                
                foreach ($dataStore['users'] as $u) {
                    if ($u['username'] === $username) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Username already exists']);
                        exit;
                    }
                }
                
                $newUser = [
                    'id' => $dataStore['nextUserId']++,
                    'username' => $username,
                    'password' => hashPassword($password),
                    'user_type' => $userType,
                    'created_at' => date('c')
                ];
                
                $dataStore['users'][] = $newUser;
                http_response_code(201);
                echo json_encode(['success' => true, 'user' => $newUser]);
            } elseif ($path === '/images') {
                $name = $body['name'];
                $category = $body['category'];
                $filename = $body['filename'];
                $imageData = $body['imageData'];
                
                $newImage = [
                    'id' => $dataStore['nextImageId']++,
                    'name' => $name,
                    'filename' => $filename,
                    'category' => $category,
                    'imageData' => $imageData,
                    'created_at' => date('c')
                ];
                
                $dataStore['images'][] = $newImage;
                http_response_code(201);
                echo json_encode(['success' => true, 'image' => $newImage]);
            } elseif ($path === '/clicks') {
                $userId = $body['user_id'];
                $imageId = $body['image_id'];
                
                $newClick = [
                    'id' => $dataStore['nextClickId']++,
                    'user_id' => $userId,
                    'image_id' => $imageId,
                    'clicked_at' => date('c')
                ];
                
                $dataStore['clicks'][] = $newClick;
                http_response_code(201);
                echo json_encode(['success' => true, 'click' => $newClick]);
            } elseif ($path === '/users/bulk') {
                $users = $body['users'];
                $successCount = 0;
                $errors = [];
                
                foreach ($users as $index => $userData) {
                    try {
                        $username = trim($userData['username']);
                        $password = trim($userData['password']);
                        $userType = strtolower(trim($userData['user_type']));
                        
                        if (empty($username) || empty($password)) {
                            $errors[] = "Row " . ($index + 1) . ": Username and password cannot be empty";
                            continue;
                        }
                        
                        if (!in_array($userType, ['admin', 'a', 'b', 'c'])) {
                            $errors[] = "Row " . ($index + 1) . ": Invalid user_type '$userType'. Must be admin, A, B, or C";
                            continue;
                        }
                        
                        foreach ($dataStore['users'] as $u) {
                            if ($u['username'] === $username) {
                                $errors[] = "Row " . ($index + 1) . ": Username '$username' already exists";
                                continue 2;
                            }
                        }
                        
                        $newUser = [
                            'id' => $dataStore['nextUserId']++,
                            'username' => $username,
                            'password' => hashPassword($password),
                            'user_type' => $userType,
                            'created_at' => date('c')
                        ];
                        
                        $dataStore['users'][] = $newUser;
                        $successCount++;
                    } catch (Exception $error) {
                        $errors[] = "Row " . ($index + 1) . ": " . $error->getMessage();
                    }
                }
                
                echo json_encode([
                    'success' => true,
                    'successCount' => $successCount,
                    'errorCount' => count($errors),
                    'errors' => $errors
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Endpoint not found']);
            }
            break;

        case 'DELETE':
            if (preg_match('/^\/users\/(\d+)$/', $path, $matches)) {
                $userId = (int)$matches[1];
                $userIndex = -1;
                
                foreach ($dataStore['users'] as $index => $u) {
                    if ($u['id'] === $userId) {
                        $userIndex = $index;
                        break;
                    }
                }
                
                if ($userIndex === -1) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'User not found']);
                    exit;
                }
                
                array_splice($dataStore['users'], $userIndex, 1);
                $dataStore['clicks'] = array_filter($dataStore['clicks'], function($c) use ($userId) {
                    return $c['user_id'] !== $userId;
                });
                echo json_encode(['success' => true]);
            } elseif (preg_match('/^\/images\/(\d+)$/', $path, $matches)) {
                $imageId = (int)$matches[1];
                $imageIndex = -1;
                
                foreach ($dataStore['images'] as $index => $i) {
                    if ($i['id'] === $imageId) {
                        $imageIndex = $index;
                        break;
                    }
                }
                
                if ($imageIndex === -1) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Image not found']);
                    exit;
                }
                
                array_splice($dataStore['images'], $imageIndex, 1);
                $dataStore['clicks'] = array_filter($dataStore['clicks'], function($c) use ($imageId) {
                    return $c['image_id'] !== $imageId;
                });
                echo json_encode(['success' => true]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Endpoint not found']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $error) {
    error_log('API Error: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}
?>
