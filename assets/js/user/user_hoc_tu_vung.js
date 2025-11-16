// Khởi tạo các phần tử DOM
const soluonghientai = document.getElementById('soluonghientai');
const soluongtuvung = document.getElementById('soluongtuvung');
const frame = document.getElementById('frame_flashcard');
const btnPrev = document.querySelector('.fa-chevron-left');
const btnNext = document.querySelector('.fa-chevron-right');
const btnPhatAm = document.getElementById('phatam');
const btnDanhDauDaHoc = document.getElementById('btn_danhdaudahoc');
const btnLuyenTap = document.getElementById('btn_luyentap');

// Thống kê
const daHocElement = document.getElementById('dahoc');
const conLaiElement = document.getElementById('conlai');
const tienDoElement = document.getElementById('tiendo');

// Dữ liệu từ vựng (mẫu - có thể thay bằng dữ liệu từ API)
const vocabularyData = [
  {
    word: "Hello",
    ipa: "/heˈləʊ/",
    definition: "used when meeting someone",
    meaning: "Xin chào",
    learned: false
  },
  {
    word: "Goodbye",
    ipa: "/ɡʊdˈbaɪ/",
    definition: "used when leaving someone",
    meaning: "Tạm biệt",
    learned: false
  },
  {
    word: "Thank you",
    ipa: "/θæŋk juː/",
    definition: "used to express gratitude",
    meaning: "Cảm ơn",
    learned: false
  },
  // Thêm các từ vựng khác...
];

// Biến trạng thái
let current = 0; // Bắt đầu từ 0
const total = vocabularyData.length;
let learnedCount = 0;

// Hàm cập nhật giao diện
function updateUI() {
  const currentVocab = vocabularyData[current];
  
  // Cập nhật nội dung flashcard
  document.getElementById('noidung_tuvung').textContent = currentVocab.word;
  document.getElementById('ipa').textContent = currentVocab.ipa;
  document.getElementById('dinhnghia').textContent = currentVocab.definition;
  document.getElementById('ynghia').textContent = currentVocab.meaning;
  
  // Cập nhật thanh tiến độ
  soluongtuvung.textContent = `${current + 1}/${total}`;
  soluonghientai.style.width = `${((current + 1) / total) * 100}%`;
  
  // Cập nhật thống kê
  daHocElement.textContent = learnedCount;
  conLaiElement.textContent = total - learnedCount;
  tienDoElement.textContent = `${Math.round((learnedCount / total) * 100)}%`;
  
  // Cập nhật nút đánh dấu đã học
  if (currentVocab.learned) {
    btnDanhDauDaHoc.textContent = "Đã học ✓";
    btnDanhDauDaHoc.style.backgroundColor = "#7BB7EE";
    btnDanhDauDaHoc.style.color = "white";
  } else {
    btnDanhDauDaHoc.textContent = "Đánh dấu đã học";
    btnDanhDauDaHoc.style.backgroundColor = "white";
    btnDanhDauDaHoc.style.color = "black";
  }
  
  // Đảm bảo flashcard ở mặt trước
  frame.classList.remove('flipped');
}

// Hàm chuyển đến từ tiếp theo
function nextCard() {
  if (current < total - 1) {
    current++;
    updateUI();
  }
}

// Hàm quay lại từ trước đó
function prevCard() {
  if (current > 0) {
    current--;
    updateUI();
  }
}

// Hàm đánh dấu đã học
function toggleLearned() {
  const currentVocab = vocabularyData[current];
  
  if (!currentVocab.learned) {
    currentVocab.learned = true;
    learnedCount++;
  } else {
    currentVocab.learned = false;
    learnedCount--;
  }
  
  updateUI();
}

// Hàm phát âm (Text-to-Speech)
function speakWord() {
  const currentVocab = vocabularyData[current];
  
  if ('speechSynthesis' in window) {
    // Dừng phát âm hiện tại nếu có
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(currentVocab.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // Tốc độ phát âm chậm hơn một chút
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Trình duyệt của bạn không hỗ trợ phát âm!');
  }
}

// Event Listeners
// Lật thẻ khi click vào flashcard
frame.addEventListener('click', () => {
  frame.classList.toggle('flipped');
});

// Nút điều khiển
btnPrev.addEventListener('click', (e) => {
  e.stopPropagation(); // Ngăn không cho lật thẻ
  prevCard();
});

btnNext.addEventListener('click', (e) => {
  e.stopPropagation(); // Ngăn không cho lật thẻ
  nextCard();
});

// Nút phát âm
btnPhatAm.addEventListener('click', (e) => {
  e.stopPropagation();
  speakWord();
});

// Nút đánh dấu đã học
btnDanhDauDaHoc.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleLearned();
});

// Nút luyện tập (có thể thêm chức năng sau)
btnLuyenTap.addEventListener('click', (e) => {
  e.stopPropagation();
  window.location.href = 'user_hinh_thuc_on_tap.html';
});

// Hỗ trợ phím tắt
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      prevCard();
      break;
    case 'ArrowRight':
      nextCard();
      break;
    case ' ':
      e.preventDefault();
      frame.classList.toggle('flipped');
      break;
    case 's':
    case 'S':
      speakWord();
      break;
  }
});

// Khởi tạo giao diện ban đầu
updateUI();
