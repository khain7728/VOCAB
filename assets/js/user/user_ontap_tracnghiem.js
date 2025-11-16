// Dữ liệu câu hỏi mẫu (có thể thay bằng API)
const questions = [
	{
		question: 'Xin chào',
		answers: ['hello', 'good night', 'good morning', 'fine'],
		correctIndex: 0
	},
	{
		question: 'Tạm biệt',
		answers: ['bye', 'thanks', 'hello', 'nice'],
		correctIndex: 0
	},
	{
		question: 'Cảm ơn',
		answers: ['sorry', 'please', 'thank you', 'great'],
		correctIndex: 2
	}
];

// Lấy phần tử DOM
const progressBar = document.querySelector('.socauhoihientai');
const questionEl = document.getElementById('cauhoi');
const answerEls = Array.from(document.querySelectorAll('.cautraloi'));
const actionBar = document.getElementById('thaotac');
const btnKnown = document.getElementById('dathuoctunay');
const btnForgot = document.getElementById('quentunay');
const btnNext = document.getElementById('tieptheo');
const btnNextAnchor = btnNext.querySelector('a');

let currentIndex = 0;
const total = questions.length;
let answered = false;

function renderQuestion() {
	const q = questions[currentIndex];
	questionEl.textContent = q.question;
	// Bơm đáp án
	q.answers.forEach((ans, i) => {
		if (answerEls[i]) {
			answerEls[i].textContent = ans;
			answerEls[i].classList.remove('correct', 'incorrect', 'disabled');
			answerEls[i].setAttribute('data-index', i);
		}
	});
	// Reset trạng thái
	answered = false;
	actionBar.classList.remove('show');
	btnNextAnchor.innerHTML = currentIndex === total - 1 ? 'Kết thúc <i class="fa-solid fa-flag-checkered"></i>' : 'Tiếp theo <i class="fa-solid fa-arrow-right"></i>';
	updateProgress();
}

function updateProgress() {
	const percent = ((currentIndex) / total) * 100; // thanh chạy từ 0 đến <100 trước khi trả lời cuối
	progressBar.style.width = percent + '%';
}

function lockAnswers() {
	answerEls.forEach(el => el.classList.add('disabled'));
}

function handleAnswerClick(e) {
	if (answered) return;
	const clicked = e.currentTarget;
	const idx = parseInt(clicked.getAttribute('data-index'), 10);
	const correctIdx = questions[currentIndex].correctIndex;
	if (idx === correctIdx) {
		clicked.classList.add('correct');
	} else {
		clicked.classList.add('incorrect');
		// highlight correct
		const correctEl = answerEls[correctIdx];
		correctEl.classList.add('correct');
	}
	lockAnswers();
	answered = true;
	actionBar.classList.add('show');
	// Sau khi trả lời đúng/ sai, cập nhật progress đến câu hiện tại (đã hoàn thành)
	progressBar.style.width = ((currentIndex + 1) / total) * 100 + '%';
}

answerEls.forEach(el => {
	el.addEventListener('click', handleAnswerClick);
});

btnNext.addEventListener('click', (e) => {
	e.preventDefault();
	if (!answered) return; // yêu cầu trả lời trước
	if (currentIndex < total - 1) {
		currentIndex++;
		renderQuestion();
	} else {
		// Kết thúc - có thể điều hướng hoặc hiển thị thông báo
		btnNextAnchor.innerHTML = 'Đã kết thúc';
		btnNext.disabled = true;
		btnNext.style.opacity = '0.6';
	}
});

// Các nút Đã thuộc / Quên có thể dùng để ghi lại trạng thái (demo)
btnKnown.addEventListener('click', () => {
	btnKnown.classList.add('correct');
	setTimeout(() => btnKnown.classList.remove('correct'), 600);
});
btnForgot.addEventListener('click', () => {
	btnForgot.classList.add('incorrect');
	setTimeout(() => btnForgot.classList.remove('incorrect'), 600);
});

// Khởi tạo
renderQuestion();
