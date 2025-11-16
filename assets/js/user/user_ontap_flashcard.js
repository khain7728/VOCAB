// Demo dữ liệu flashcard (có thể thay bằng dữ liệu API)
let flashcards = [
	{ word: 'Hello', ipa: '/heˈləʊ/', definition: 'used when meeting someone', meaning: 'Xin chào' },
	{ word: 'Goodbye', ipa: '/ˌɡʊdˈbaɪ/', definition: 'used when leaving someone', meaning: 'Tạm biệt' },
	{ word: 'Thank you', ipa: '/ˈθæŋk juː/', definition: 'used to express gratitude', meaning: 'Cảm ơn' }
];

// DOM elements
const fcFrame = document.getElementById('frame_flashcard');
const fcWord = document.getElementById('noidung_tuvung');
const fcIPA = document.getElementById('ipa');
const fcDef = document.getElementById('dinhnghia');
const fcMean = document.getElementById('ynghia');
const fcProgressBar = document.querySelector('.socauhoihientai');

const btnSpeak = document.getElementById('frame_phatam');
const btnKnown = document.getElementById('dathuoctunay');
const btnForgot = document.getElementById('quentunay');
const btnPrev = document.getElementById('quaylai');
const btnNext = document.getElementById('tieptheo');

let fcIndex = 0;
let fcTotal = flashcards.length;

// Shuffle deck on init
function shuffle(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
}
shuffle(flashcards);

function updateProgress() {
	const percent = (fcIndex / fcTotal) * 100;
	fcProgressBar.style.width = percent + '%';
}

function renderFlashcard() {
	const c = flashcards[fcIndex];
	fcWord.textContent = c.word;
	fcIPA.textContent = c.ipa;
	fcDef.textContent = c.definition;
	fcMean.textContent = c.meaning;
	btnNext.innerHTML = fcIndex === fcTotal - 1 ? 'Kết thúc <i class="fa-solid fa-flag-checkered"></i>' : 'Tiếp theo <i class="fa-solid fa-arrow-right"></i>';
	updateProgress();
	fcFrame.classList.remove('flipped');
}

// Flip on click
fcFrame.addEventListener('click', () => {
	fcFrame.classList.toggle('flipped');
});

// Speak
btnSpeak.addEventListener('click', (e) => {
	e.stopPropagation();
	const c = flashcards[fcIndex];
	if ('speechSynthesis' in window) {
		window.speechSynthesis.cancel();
		const u = new SpeechSynthesisUtterance(c.word);
		u.lang = 'en-US';
		u.rate = 0.9;
		window.speechSynthesis.speak(u);
	}
});

// Known / Forgot simple feedback
btnKnown.addEventListener('click', (e) => {
	e.stopPropagation();
	btnKnown.style.transform = 'scale(0.95)';
	setTimeout(() => btnKnown.style.transform = 'scale(1)', 120);
});
btnForgot.addEventListener('click', (e) => {
	e.stopPropagation();
	btnForgot.style.transform = 'scale(0.95)';
	setTimeout(() => btnForgot.style.transform = 'scale(1)', 120);
});

// Prev
btnPrev.addEventListener('click', (e) => {
	e.preventDefault();
	if (fcIndex > 0) {
		fcIndex--;
		renderFlashcard();
	}
});

// Next
btnNext.addEventListener('click', (e) => {
	e.preventDefault();
	if (fcIndex < fcTotal - 1) {
		fcIndex++;
		renderFlashcard();
		// Sau khi chuyển câu, cập nhật progress đã hoàn thành câu trước
		fcProgressBar.style.width = ((fcIndex) / fcTotal) * 100 + '%';
	} else {
		window.location.href = 'user_ontap_ketqua.html';
		btnNext.disabled = true;
		btnNext.style.opacity = '0.6';
	}
});

// Shortcut: Space to flip, Right Arrow to next
document.addEventListener('keydown', (e) => {
	if (e.key === ' ') {
		e.preventDefault();
		fcFrame.classList.toggle('flipped');
	} else if (e.key === 'ArrowRight') {
		btnNext.click();
	} else if (e.key === 'ArrowLeft') {
		btnPrev.click();
	} else if (e.key.toLowerCase() === 's') {
		btnSpeak.click();
	}
});

// Init
renderFlashcard();
