# 📡 Cross-Tab Synchronization - Documentation

## 🎯 Mục đích

Đồng bộ dữ liệu real-time giữa các tab/window để user không cần F5 khi có thay đổi.

---

## 🚀 Quick Start

### 1. Include scripts trong HTML

```html
<!-- Thêm TRƯỚC các file JS khác -->
<script src="../../assets/js/defaut/sync_manager.js"></script>
<script src="../../assets/js/defaut/sync_helpers.js"></script>

<!-- Your page scripts -->
<script src="../../assets/js/user/user_Dashboard.js"></script>
```

### 2. Broadcast khi có action

```javascript
// Khi user đánh dấu từ đã học
window.SyncManager.broadcast(window.SYNC_ACTIONS.WORD_LEARNED, {
    wordId: 123,
    courseId: 1,
    userId: USER_ID
});

// Khi user tham gia khóa học
window.SyncManager.broadcast(window.SYNC_ACTIONS.COURSE_JOINED, {
    courseId: 5,
    userId: USER_ID
});

// Khi user cập nhật profile
window.SyncManager.broadcast(window.SYNC_ACTIONS.PROFILE_UPDATED, {
    name: 'New Name',
    avatar: 'new_avatar.jpg'
});
```

### 3. Listen và react (tự động - không cần code thêm!)

Các helper đã tự động setup listeners. Chỉ cần đảm bảo các function sau TỒN TẠI:

- `loadDashboardStats()` - Sẽ tự động gọi khi cần refresh dashboard
- `fetchMyCourses()` - Sẽ tự động gọi khi có thay đổi về courses
- `loadDailyGoal()` - Sẽ tự động gọi khi update goal

---

## 📋 Available Actions

### Learning Actions
- `WORD_LEARNED` - User đánh dấu từ đã học
- `WORD_UNLEARNED` - User bỏ đánh dấu từ

### Course Actions
- `COURSE_CREATED` - Tạo khóa học mới
- `COURSE_UPDATED` - Cập nhật khóa học
- `COURSE_DELETED` - Xóa khóa học
- `COURSE_JOINED` - Tham gia khóa học
- `COURSE_LEFT` - Rời khỏi khóa học

### Quiz/Review Actions
- `QUIZ_COMPLETED` - Hoàn thành bài kiểm tra
- `REVIEW_COMPLETED` - Hoàn thành ôn tập

### Profile Actions
- `PROFILE_UPDATED` - Cập nhật profile
- `AVATAR_UPDATED` - Đổi avatar

### Goal Actions
- `DAILY_GOAL_UPDATED` - Cập nhật mục tiêu hằng ngày

### Admin Actions
- `USER_STATUS_CHANGED` - Admin thay đổi trạng thái user

### General Actions
- `REFRESH_DASHBOARD` - Force refresh dashboard
- `REFRESH_COURSE_LIST` - Force refresh course list

---

## 🔧 Advanced Usage

### Custom Listener

```javascript
// Đăng ký custom listener
window.SyncManager.on(window.SYNC_ACTIONS.WORD_LEARNED, (payload) => {
    console.log('Word learned:', payload);
    
    // Custom logic
    updateWordCounter(payload.wordId);
});
```

### Broadcast với auto-refresh

```javascript
// Broadcast và tự động trigger refresh dashboard sau 500ms
window.syncAndRefreshDashboard(window.SYNC_ACTIONS.WORD_LEARNED, {
    wordId: 123
});

// Broadcast và tự động trigger refresh course list
window.syncAndRefreshCourses(window.SYNC_ACTIONS.COURSE_CREATED, {
    courseId: 5
});
```

### Unregister Listener

```javascript
function myHandler(payload) {
    console.log('Handling...', payload);
}

// Register
window.SyncManager.on(window.SYNC_ACTIONS.WORD_LEARNED, myHandler);

// Unregister
window.SyncManager.off(window.SYNC_ACTIONS.WORD_LEARNED, myHandler);
```

---

## 📁 Ví dụ thực tế

### user_hoc_tu_vung.js

```javascript
// Khi đánh dấu từ đã học
async function toggleLearned() {
    // ... existing code ...
    
    const result = await updateLearnedStatus(wordId, learned);
    
    if (result.success) {
        // Broadcast để tabs khác biết
        window.SyncManager.broadcast(window.SYNC_ACTIONS.WORD_LEARNED, {
            wordId: wordId,
            courseId: COURSE_ID,
            learned: learned
        });
    }
}
```

### khoa_hoc_cua_toi.js

```javascript
// Khi tạo khóa học mới
async function createCourse(data) {
    const result = await saveCourse(data);
    
    if (result.success) {
        // Broadcast và auto-refresh
        window.syncAndRefreshCourses(window.SYNC_ACTIONS.COURSE_CREATED, {
            courseId: result.course_id
        });
    }
}
```

### ho_so_user.js

```javascript
// Khi cập nhật profile
async function updateProfile(name, bio) {
    const result = await saveProfile(name, bio);
    
    if (result.success) {
        window.SyncManager.broadcast(window.SYNC_ACTIONS.PROFILE_UPDATED, {
            name: name,
            avatar: result.avatar_url
        });
    }
}
```

---

## 🐛 Debug Mode

Debug mode tự động BẬT khi `localhost`, TẮT khi production.

Xem logs trong Console:
```
[SyncManager] SyncManager initialized
[SyncManager] ✅ Broadcast Channel enabled
[SyncManager] 📤 Broadcasting: WORD_LEARNED {wordId: 123}
[SyncManager] 📥 Received: WORD_LEARNED {wordId: 123}
[Sync] Refreshing dashboard due to: WORD_LEARNED
```

Force enable debug trong production:
```javascript
window.SyncManager.debug = true;
```

---

## ✅ Browser Support

| Browser | Broadcast Channel | Storage Event Fallback |
|---------|------------------|------------------------|
| Chrome 54+ | ✅ | ✅ |
| Firefox 38+ | ✅ | ✅ |
| Safari 15.4+ | ✅ | ✅ |
| Edge 79+ | ✅ | ✅ |
| IE 11 | ❌ | ✅ (fallback) |

Tự động fallback sang Storage Event nếu browser không support Broadcast Channel.

---

## 🎨 Best Practices

### ✅ DO:
- Broadcast SAU KHI API call thành công
- Dùng action constants (window.SYNC_ACTIONS.*)
- Payload nhỏ gọn (chỉ ID + thông tin cần thiết)
- Test với nhiều tabs cùng lúc

### ❌ DON'T:
- Broadcast TRƯỚC KHI API call (data chưa save vào DB)
- Tạo action mới khi đã có action tương tự
- Payload quá lớn (>1KB)
- Broadcast quá nhiều lần trong 1s (gây spam)

---

## 🚀 Deployment Checklist

- [x] Include sync_manager.js và sync_helpers.js trong tất cả pages
- [x] Thêm broadcast vào các actions quan trọng
- [x] Test cross-tab sync trên localhost
- [x] Test trên production URL
- [x] Verify debug mode TẮT trên production

---

## 📞 Troubleshooting

### Sync không hoạt động?

1. Check Console có log "[SyncManager] initialized" không
2. Check file sync_manager.js đã include chưa
3. Check action constant có đúng không (dùng window.SYNC_ACTIONS.*)
4. Check browser support (F12 → Console → gõ: `'BroadcastChannel' in window`)

### Infinite loop?

Tab A broadcast → Tab B nhận → Tab B broadcast lại → Tab A nhận lại...

**Giải pháp:** Đã handle bằng `tabId` - mỗi tab có ID riêng, bỏ qua message từ chính mình.

### Message bị delay?

Broadcast Channel là INSTANT, không delay. Nếu có delay:
- Check network (API call có chậm không)
- Check logic refresh có debounce/throttle không

---

## 🎉 Kết quả mong đợi

✅ Mở 2 tabs → Học từ ở tab 1 → Tab 2 dashboard TỰ ĐỘNG update  
✅ Tham gia khóa học ở tab 1 → Tab 2 course list TỰ ĐỘNG refresh  
✅ Đổi tên/avatar ở tab 1 → Tab 2 header TỰ ĐỘNG update  
✅ Zero configuration khi deploy  
✅ Không cần chỉnh URL hay config gì cả  

---

**Developed for VOCAB Project - December 2025**
