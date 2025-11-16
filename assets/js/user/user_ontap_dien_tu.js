// Dữ liệu điền từ (mẫu) - có thể thay bằng API
const dienTuQuestions = [
	{ question: 'Xin chào', answer: 'hello' },
	{ question: 'Cảm ơn', answer: 'thank you' },
	{ question: 'Tạm biệt', answer: 'bye' }
];

// Phần tử DOM
const dtProgressBar = document.querySelector('.socauhoihientai');
const dtQuestionEl = document.getElementById('cauhoi');
const dtInput = document.getElementById('dapan');
const dtHint = document.querySelector('#frame_dapan p');
const dtCheckBtn = document.getElementById('kiemtra');
const dtActionBar = document.getElementById('thaotac');
const dtBtnKnown = document.getElementById('dathuoctunay');
const dtBtnForgot = document.getElementById('quentunay');
const dtBtnNext = document.getElementById('tieptheo');
const dtBtnNextAnchor = dtBtnNext.querySelector('a');

let dtIndex = 0;
const dtTotal = dienTuQuestions.length;
let dtChecked = false;

function dtUpdateProgress() {
	// chạy từ 0% đến 100% khi người dùng đã kiểm tra câu hiện tại
	const percent = (dtIndex / dtTotal) * 100;
	dtProgressBar.style.width = percent + '%';
}

function dtRender() {
	const q = dienTuQuestions[dtIndex];
	dtQuestionEl.textContent = q.question;
	dtInput.value = '';
	dtInput.classList.remove('correct', 'incorrect');
	dtInput.disabled = false;
	dtHint.textContent = 'Vui lòng nhập đáp án';
	dtChecked = false;
	dtActionBar.classList.remove('show');
	dtBtnNextAnchor.innerHTML = dtIndex === dtTotal - 1 ? 'Kết thúc <i class="fa-solid fa-flag-checkered"></i>' : 'Tiếp theo <i class="fa-solid fa-arrow-right"></i>';
	dtUpdateProgress();
	dtInput.focus();
}

function dtNormalize(str) {
	return (str || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

function dtCheckAnswer() {
	if (dtChecked) return;
	const correct = dtNormalize(dienTuQuestions[dtIndex].answer);
	const user = dtNormalize(dtInput.value);
	if (!user) {
		dtHint.textContent = 'Bạn chưa nhập đáp án';
		dtHint.style.color = '#FF0404';
		return;
	}
	if (user === correct) {
		dtInput.classList.add('correct');
		dtHint.textContent = 'Chính xác!';
		dtHint.style.color = '#2F80ED';
	} else {
		dtInput.classList.add('incorrect');
		dtHint.textContent = `Đáp án đúng: ${dienTuQuestions[dtIndex].answer}`;
		dtHint.style.color = '#FF0404';
	}
	dtInput.disabled = true;
	dtChecked = true;
	dtActionBar.classList.add('show');
	// cập nhật tiến trình đã hoàn thành câu hiện tại
	dtProgressBar.style.width = ((dtIndex + 1) / dtTotal) * 100 + '%';
}

dtCheckBtn.addEventListener('click', dtCheckAnswer);

// Enter để kiểm tra hoặc sang câu tiếp
dtInput.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		if (!dtChecked) dtCheckAnswer();
		else dtGoNext(e);
	}
});

function dtGoNext(e) {
	e.preventDefault();
	if (!dtChecked) return;
	if (dtIndex < dtTotal - 1) {
		dtIndex++;
		dtRender();
	} else {
		dtBtnNextAnchor.innerHTML = 'Đã kết thúc';
		dtBtnNext.disabled = true;
		dtBtnNext.style.opacity = '0.6';
	}
}

dtBtnNext.addEventListener('click', dtGoNext);

// Hiệu ứng nhỏ cho Đã thuộc/Quên
dtBtnKnown.addEventListener('click', () => {
	dtBtnKnown.style.transform = 'scale(0.95)';
	setTimeout(() => dtBtnKnown.style.transform = 'scale(1)', 120);
});
dtBtnForgot.addEventListener('click', () => {
	dtBtnForgot.style.transform = 'scale(0.95)';
	setTimeout(() => dtBtnForgot.style.transform = 'scale(1)', 120);
});

// Khởi tạo
dtRender();
