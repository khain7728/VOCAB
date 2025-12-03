// =====================================================
// TRANG KẾT QUẢ ÔN TẬP
// =====================================================

// Lấy tham số từ URL
const urlParams = new URLSearchParams(window.location.search);
const COURSE_ID = urlParams.get('course_id') || 1;
const USER_ID = localStorage.getItem('user_id');

console.log('=== INIT PAGE ===');
console.log('COURSE_ID:', COURSE_ID);
console.log('USER_ID:', USER_ID);

/**
 * Lấy kết quả từ sessionStorage
 */
function getResults() {
    const resultsJson = sessionStorage.getItem('review_results');
    
    if (!resultsJson) {
        console.warn('Không có kết quả trong sessionStorage');
        window.location.href = `user_hinh_thuc_on_tap.html?course_id=${COURSE_ID}&user_id=${USER_ID}`;
        return null;
    }
    
    return JSON.parse(resultsJson);
}

/**
 * Hiển thị kết quả - KHÔNG THAY ĐỔI GÌ CẢ
 */
function displayResults() {
    const results = getResults();
    if (!results) return;

    console.log('Kết quả:', results);
    // Không thay đổi giao diện, giữ nguyên HTML
}

/**
 * Kiểm tra có thể luyện tập tiếp không
 * Logic: Nếu đã vào được trang kết quả ôn tập này, nghĩa là đã có đủ từ để luyện tập rồi
 * => Cho phép luyện tập tiếp luôn!
 */
async function canContinueReview() {
    // Nếu đang ở trang kết quả ôn tập (có review_results) thì chắc chắn có thể luyện tập tiếp
    const hasResults = sessionStorage.getItem('review_results');
    if (hasResults) {
        console.log('✅ Đã có kết quả ôn tập => Cho phép luyện tập tiếp');
        return true;
    }
    
    // Nếu không có kết quả (trường hợp vào trang này trực tiếp), kiểm tra API
    try {
        console.log(`Đang kiểm tra từ đã học cho course_id=${COURSE_ID}, user_id=${USER_ID}`);
        const response = await fetch(`../../api/get-words.php?course_id=${COURSE_ID}&user_id=${USER_ID}`);
        const data = await response.json();
        
        console.log('Response từ API:', data);
        
        if (data.success && data.data && data.data.words) {
            const words = data.data.words;
            console.log(`Tổng số từ: ${words.length}`);
            
            // Đếm từ đã học (learned_status = 1 hoặc 'learned')
            const learnedWords = words.filter(word => 
                word.learned_status == 1 || word.learned_status === 'learned'
            );
            
            console.log(`Số từ đã học: ${learnedWords.length}`);
            
            return learnedWords.length >= 2;
        }
        
        console.warn('API không trả về dữ liệu hợp lệ:', data);
        return false;
    } catch (error) {
        console.error('Lỗi kiểm tra từ đã học:', error);
        return false;
    }
}

/**
 * Setup các link điều hướng
 */
async function setupLinks() {
    console.log('=== SETUP LINKS ===');
    
    // Link 1: Trang chủ
    const linkTrangChu = document.getElementById('link-trang-chu');
    if (linkTrangChu) {
        console.log('Found link-trang-chu');
        linkTrangChu.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Click Trang chủ');
            window.location.href = `user_Dashboard.html?user_id=${USER_ID}`;
        });
    } else {
        console.error('Không tìm thấy link-trang-chu');
    }

    // Link 2: Khóa học
    const linkKhoaHoc = document.getElementById('link-khoa-hoc');
    if (linkKhoaHoc) {
        console.log('Found link-khoa-hoc');
        linkKhoaHoc.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Click Khóa học');
            window.location.href = `khoa_hoc_cua_toi.html?user_id=${USER_ID}`;
        });
    } else {
        console.error('Không tìm thấy link-khoa-hoc');
    }

    // Link 3: Luyện tập tiếp
    const linkLuyenTap = document.getElementById('link-luyen-tap');
    if (linkLuyenTap) {
        console.log('Found link-luyen-tap');
        
        const canReview = await canContinueReview();
        console.log(`canReview = ${canReview}`);
        
        if (canReview) {
            console.log('✅ Cho phép luyện tập tiếp');
            linkLuyenTap.style.opacity = '1';
            linkLuyenTap.style.cursor = 'pointer';
            linkLuyenTap.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Click Luyện tập -> Chuyển trang');
                window.location.href = `user_hinh_thuc_on_tap.html?course_id=${COURSE_ID}&user_id=${USER_ID}`;
            });
        } else {
            console.log('❌ Chưa đủ từ, disable link');
            linkLuyenTap.style.opacity = '0.5';
            linkLuyenTap.style.cursor = 'not-allowed';
            linkLuyenTap.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Bạn cần học ít nhất 2 từ vựng trước khi ôn tập!');
            });
        }
    } else {
        console.error('Không tìm thấy link-luyen-tap');
    }
    
    console.log('=== SETUP LINKS DONE ===');
}

// Khởi động khi trang load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== DOM LOADED ===');
    displayResults();
    await setupLinks();
});
