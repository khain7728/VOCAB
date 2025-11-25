<?php
/**
 * CẤU HÌNH OAUTH - FACEBOOK & GOOGLE
 * Lưu thông tin App ID, Secret, Redirect URI
 */

// ========================================
// FACEBOOK LOGIN
// ========================================
// Tạo Facebook App tại: https://developers.facebook.com/apps/
define('FACEBOOK_APP_ID', 'YOUR_FACEBOOK_APP_ID');
define('FACEBOOK_APP_SECRET', 'YOUR_FACEBOOK_APP_SECRET');
define('FACEBOOK_REDIRECT_URI', 'http://localhost/VOCAB/auth/facebook-callback.php');

// Facebook Graph API version
define('FACEBOOK_API_VERSION', 'v18.0');

// ========================================
// GOOGLE LOGIN
// ========================================
// Tạo Google OAuth Client tại: https://console.cloud.google.com/apis/credentials
define('GOOGLE_CLIENT_ID', '774278002648-lajpfdu089cqjogp9sg0fat7hmasqgfo.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', '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');
define('GOOGLE_REDIRECT_URI', 'http://localhost/VOCAB/auth/google-callback.php');

