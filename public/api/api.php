<?php
// تفعيل عرض الأخطاء للتصحيح (يمكن إيقافها في الإنتاج)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// إعدادات CORS للسماح بالوصول للملف من الاستضافة المحلية ومن الدومين الجديد
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// التعامل مع طلبات Preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// بيانات الاتصال بقاعدة البيانات
$host = 'localhost';
$db   = 'u553133910_menumaghagha';
$user = 'u553133910_menumaghaghaY'; 
$pass = 'UJ2_q+aw3@8ZALC';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
    exit();
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 1. جلب كافة البيانات للموقع دفعة واحدة لتسريع التحميل
    if ($action === 'get_all_data') {
        try {
            $data = [];
            
            // جلب الجداول البسيطة مباشرة
            $tables = [
                'captains', 'doctors', 'doctor_categories', 'restaurants', 
                'restaurant_categories', 'supermarkets', 'pharmacies', 
                'gov_services', 'job_seekers', 'job_vacancies'
            ];
            
            foreach ($tables as $table) {
                $stmt = $pdo->query("SELECT * FROM `$table`");
                $rows = $stmt->fetchAll();
                
                // معالجة الحقول التي تم تخزينها كـ JSON
                foreach ($rows as &$row) {
                    if (isset($row['serviceTypes'])) $row['serviceTypes'] = json_decode($row['serviceTypes']);
                    if (isset($row['phones'])) $row['phones'] = json_decode($row['phones']);
                    if (isset($row['workingHours'])) $row['workingHours'] = json_decode($row['workingHours']);
                    if (isset($row['menuImages'])) $row['menuImages'] = json_decode($row['menuImages']);
                }
                
                $data[$table] = $rows;
            }
            
            // جلب الاتصالات وتنسيقها لتطابق هيكل Firebase القديم
            $callsStmt = $pdo->query("SELECT * FROM `calls`");
            $callsRaw = $callsStmt->fetchAll();
            $calls = [];
            foreach ($callsRaw as $c) {
                $cat = $c['entity_category'];
                $eId = $c['entity_id'];
                $calls[$cat][$eId] = (int)$c['call_count'];
            }
            $data['calls'] = $calls;

            // جلب التقييمات (يتم إعادتها كـ sum و count لتطابق هيكل Firebase)
            $ratingsStmt = $pdo->query("SELECT * FROM `ratings`");
            $ratingsRaw = $ratingsStmt->fetchAll();
            $ratings = [];
            foreach ($ratingsRaw as $r) {
                $eId = $r['entity_id'];
                $ratings[$eId] = [
                    'sum' => (float)$r['rating_score'], // نستخدم rating_score كمجموع التقييمات
                    'count' => (int)$r['rating_count']
                ];
            }
            $data['ratings'] = $ratings;

            // جلب الزيارات
            $visitsStmt = $pdo->query("SELECT * FROM `site_visits`");
            $visitsRaw = $visitsStmt->fetchAll();
            $visits = ['daily' => []];
            foreach ($visitsRaw as $v) {
                $visits['daily'][$v['date']] = (int)$v['visits_count'];
            }
            $data['site_visits'] = $visits;

            echo json_encode(["status" => "success", "data" => $data]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
} 

elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // 2. تسجيل وحساب عدد الاتصالات
    if ($action === 'record_call') {
        $category = $input['category'] ?? '';
        $entityId = $input['entity_id'] ?? '';
        
        if ($category && $entityId) {
            try {
                $stmt = $pdo->prepare("INSERT INTO `calls` (entity_category, entity_id, call_count) 
                                       VALUES (?, ?, 1) 
                                       ON DUPLICATE KEY UPDATE call_count = call_count + 1");
                $stmt->execute([$category, $entityId]);
                echo json_encode(["status" => "success", "message" => "Call recorded"]);
            } catch (Exception $e) {
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Missing parameters"]);
        }
    }
    
    // 3. تسجيل الزيارات اليومية للموقع
    elseif ($action === 'record_visit') {
        $today = date('Y-m-d');
        try {
            $stmt = $pdo->prepare("INSERT INTO `site_visits` (date, visits_count) 
                                   VALUES (?, 1) 
                                   ON DUPLICATE KEY UPDATE visits_count = visits_count + 1");
            $stmt->execute([$today]);
            echo json_encode(["status" => "success", "message" => "Visit recorded"]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    // 3.5. تسجيل تقييم جديد
    elseif ($action === 'submit_rating') {
        $category = $input['category'] ?? 'restaurants';
        $entityId = $input['entity_id'] ?? '';
        $ratingValue = (float)($input['rating_value'] ?? 0);

        if ($entityId && $ratingValue > 0) {
            try {
                $stmt = $pdo->prepare("INSERT INTO `ratings` (entity_category, entity_id, rating_score, rating_count) 
                                       VALUES (?, ?, ?, 1) 
                                       ON DUPLICATE KEY UPDATE rating_score = rating_score + ?, rating_count = rating_count + 1");
                $stmt->execute([$category, $entityId, $ratingValue, $ratingValue]);
                echo json_encode(["status" => "success", "message" => "Rating submitted"]);
            } catch (Exception $e) {
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid parameters"]);
        }
    }
    
    // 4. حفظ وتحديث القوائم من لوحة التحكم (Admin Panel)
    elseif ($action === 'save_collection') {
        $collection = $input['collection'] ?? '';
        $list = $input['data'] ?? [];
        
        $allowedCollections = [
            'captains', 'doctors', 'doctor_categories', 'restaurants', 
            'restaurant_categories', 'supermarkets', 'pharmacies', 
            'gov_services', 'job_seekers', 'job_vacancies'
        ];
        
        if (in_array($collection, $allowedCollections)) {
            try {
                $pdo->beginTransaction();
                
                // مسح البيانات القديمة بالكامل لإعادة كتابتها كما في Firebase
                $pdo->exec("DELETE FROM `$collection`");
                
                if ($collection === 'captains') {
                    $stmt = $pdo->prepare("INSERT INTO captains (id, name, description, phone, whatsApp, avatar, isAvailable, tripsCount, serviceTypes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($list as $item) {
                        if (!isset($item['id'])) continue;
                        $stmt->execute([
                            $item['id'], $item['name'] ?? '', $item['description'] ?? '', 
                            $item['phone'] ?? '', $item['whatsApp'] ?? '', $item['avatar'] ?? '', 
                            isset($item['isAvailable']) ? (int)$item['isAvailable'] : 1,
                            isset($item['tripsCount']) ? (int)$item['tripsCount'] : 0,
                            json_encode($item['serviceTypes'] ?? [])
                        ]);
                    }
                } 
                elseif ($collection === 'doctors') {
                    $stmt = $pdo->prepare("INSERT INTO doctors (id, name, specialty, specialtyId, phone, address, workingDays, workingHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($list as $item) {
                        if (!isset($item['id'])) continue;
                        $stmt->execute([
                            $item['id'], $item['name'] ?? '', $item['specialty'] ?? '', 
                            $item['specialtyId'] ?? '', $item['phone'] ?? '', $item['address'] ?? '', 
                            $item['workingDays'] ?? '', json_encode($item['workingHours'] ?? '')
                        ]);
                    }
                }
                elseif ($collection === 'restaurants') {
                    $stmt = $pdo->prepare("INSERT INTO restaurants (id, name, category, description, logo, phones, whatsApp, deliveryFee, address, workingHours, menuImages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($list as $item) {
                        if (!isset($item['id'])) continue;
                        $stmt->execute([
                            $item['id'], $item['name'] ?? '', $item['category'] ?? '', 
                            $item['description'] ?? '', $item['logo'] ?? '', json_encode($item['phones'] ?? []), 
                            $item['whatsApp'] ?? '', $item['deliveryFee'] ?? '', $item['address'] ?? '',
                            json_encode($item['workingHours'] ?? ''), json_encode($item['menuImages'] ?? [])
                        ]);
                    }
                }
                elseif ($collection === 'supermarkets') {
                    $stmt = $pdo->prepare("INSERT INTO supermarkets (id, name, logo, phones, whatsApp, address, workingHours, menuImages) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($list as $item) {
                        if (!isset($item['id'])) continue;
                        $stmt->execute([
                            $item['id'], $item['name'] ?? '', $item['logo'] ?? '', 
                            json_encode($item['phones'] ?? []), $item['whatsApp'] ?? '', $item['address'] ?? '',
                            json_encode($item['workingHours'] ?? ''), json_encode($item['menuImages'] ?? [])
                        ]);
                    }
                }
                elseif ($collection === 'pharmacies') {
                    $stmt = $pdo->prepare("INSERT INTO pharmacies (id, name, phone, whatsApp, address) VALUES (?, ?, ?, ?, ?)");
                    foreach ($list as $item) {
                        if (!isset($item['id'])) continue;
                        $stmt->execute([
                            $item['id'], $item['name'] ?? '', $item['phone'] ?? '', 
                            $item['whatsApp'] ?? '', $item['address'] ?? ''
                        ]);
                    }
                }
                elseif ($collection === 'gov_services') {
                    $stmt = $pdo->prepare("INSERT INTO gov_services (id, name, number) VALUES (?, ?, ?)");
                    foreach ($list as $item) {
                        if (!isset($item['id'])) continue;
                        $stmt->execute([
                            $item['id'], $item['name'] ?? '', $item['number'] ?? ''
                        ]);
                    }
                }
                elseif ($collection === 'job_seekers') {
                    $stmt = $pdo->prepare("INSERT INTO job_seekers (id, name, jobTitle, phone, experience, education) VALUES (?, ?, ?, ?, ?, ?)");
                    foreach ($list as $item) {
                        if (!isset($item['id'])) continue;
                        $stmt->execute([
                            $item['id'], $item['name'] ?? '', $item['jobTitle'] ?? '', 
                            $item['phone'] ?? '', $item['experience'] ?? '', $item['education'] ?? ''
                        ]);
                    }
                }
                elseif ($collection === 'job_vacancies') {
                    $stmt = $pdo->prepare("INSERT INTO job_vacancies (id, title, company, phone, requirements, salary) VALUES (?, ?, ?, ?, ?, ?)");
                    foreach ($list as $item) {
                        if (!isset($item['id'])) continue;
                        $stmt->execute([
                            $item['id'], $item['title'] ?? '', $item['company'] ?? '', 
                            $item['phone'] ?? '', $item['requirements'] ?? '', $item['salary'] ?? ''
                        ]);
                    }
                }
                elseif ($collection === 'doctor_categories' || $collection === 'restaurant_categories') {
                    $stmt = $pdo->prepare("INSERT INTO `$collection` (id, name, icon) VALUES (?, ?, ?)");
                    foreach ($list as $item) {
                        if (!isset($item['id'])) continue;
                        $stmt->execute([
                            $item['id'], $item['name'] ?? '', $item['icon'] ?? ''
                        ]);
                    }
                }
                
                $pdo->commit();
                echo json_encode(["status" => "success", "message" => "Collection $collection saved successfully"]);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Collection not allowed"]);
        }
    }
}
?>
