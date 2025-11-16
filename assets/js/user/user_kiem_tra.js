// Config
const KT_TOTAL = 20;
const THEME = '#7BB7EE';

// Sample pools (replace with API later)
const POOL_MCQ = [
	{ q: 'Xin chào', choices: ['hello', 'good night', 'good morning', 'fine'], correct: 0 },
	{ q: 'Tạm biệt', choices: ['bye', 'thanks', 'hello', 'nice'], correct: 0 },
	{ q: 'Cảm ơn', choices: ['sorry', 'please', 'thank you', 'great'], correct: 2 },
	{ q: 'Buổi sáng tốt lành', choices: ['good evening', 'good morning', 'good night', 'see you'], correct: 1 },
	{ q: 'Xin lỗi', choices: ['sorry', 'thanks', 'please', 'hello'], correct: 0 },
];
const POOL_FILL = [
	{ q: 'Xin chào', a: 'hello' },
	{ q: 'Cảm ơn', a: 'thank you' },
	{ q: 'Tạm biệt', a: 'bye' },
	{ q: 'Làm ơn', a: 'please' },
	{ q: 'Xin lỗi', a: 'sorry' },
];

function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } }
function pickRandom(arr, n){ const clone=[...arr]; shuffle(clone); return clone.slice(0, n); }

function buildDeck(){
	const mcqNeeded = 10;
	const fillNeeded = KT_TOTAL - mcqNeeded;
	const mcqs = pickRandom(POOL_MCQ, Math.min(mcqNeeded, POOL_MCQ.length));
	const fills = pickRandom(POOL_FILL, Math.min(fillNeeded, POOL_FILL.length));
	while(mcqs.length < mcqNeeded) mcqs.push(POOL_MCQ[Math.floor(Math.random()*POOL_MCQ.length)]);
	while(fills.length < fillNeeded) fills.push(POOL_FILL[Math.floor(Math.random()*POOL_FILL.length)]);
	const deck = [
		...mcqs.map(it => ({ type:'mcq', ...it })),
		...fills.map(it => ({ type:'fill', ...it }))
	];
	shuffle(deck);
	return deck;
}

// DOM refs
const progressCount = document.querySelector('.kt-progress .kt-count');
const progressInner = document.querySelector('.kt-progress .kt-bar-inner');

const mcqFrame = document.getElementById('frame_tracnghiem');
const mcqQuestionEl = document.getElementById('kt-mcq-question');
const mcqAnswersWrap = mcqFrame.querySelector('.kt-answers');
const mcqAnswerEls = [
	document.getElementById('kt-mcq-a1'),
	document.getElementById('kt-mcq-a2'),
	document.getElementById('kt-mcq-a3'),
	document.getElementById('kt-mcq-a4'),
];
const mcqNextBtn = document.getElementById('kt-mcq-next');

const fillFrame = document.getElementById('frame_dientu');
const fillQuestionEl = document.getElementById('kt-fill-question');
const fillInput = document.getElementById('kt-input');
const fillHint = document.getElementById('kt-fill-hint');
const fillCheckBtn = document.getElementById('kt-fill-check');
const fillNextBtn = document.getElementById('kt-fill-next');

function normalize(str){ return (str||'').toString().trim().toLowerCase().replace(/\s+/g,' '); }

const DECK = buildDeck();
let index = 0; // answered count also reflects index

function updateProgress(){
	progressCount.textContent = `${index}/${KT_TOTAL}`;
	progressInner.style.width = `${(index/KT_TOTAL)*100}%`;
}

function hideAll(){
	mcqFrame.classList.add('kt-hidden');
	fillFrame.classList.add('kt-hidden');
}

function renderMCQ(item){
	hideAll();
	// reset state
	mcqQuestionEl.textContent = item.q;
	mcqAnswerEls.forEach((el, i)=>{
		el.textContent = item.choices[i] ?? '';
		el.dataset.index = i;
		el.classList.remove('correct','incorrect','disabled');
	});
	mcqNextBtn.classList.add('kt-hidden');
	mcqFrame.classList.remove('kt-hidden');

	let answered = false;
	function onPick(e){
		const target = e.target.closest('.kt-answer');
		if(!target || answered) return;
		answered = true;
		const pick = parseInt(target.dataset.index,10);
		const correct = item.correct;
		mcqAnswerEls.forEach((el, i)=>{
			el.classList.add('disabled');
			if(i===correct) el.classList.add('correct');
		});
		if(pick!==correct) target.classList.add('incorrect');
		mcqNextBtn.classList.remove('kt-hidden');
	}
	mcqAnswersWrap.onclick = onPick;
	mcqNextBtn.onclick = next;
}

function renderFill(item){
	hideAll();
	fillQuestionEl.textContent = item.q;
	fillInput.value = '';
	fillInput.classList.remove('correct','incorrect');
	fillInput.disabled = false;
	fillHint.textContent = 'Vui lòng nhập đáp án';
	fillHint.style.color = '#888';
	fillCheckBtn.classList.remove('kt-hidden');
	fillNextBtn.classList.add('kt-hidden');
	fillFrame.classList.remove('kt-hidden');
	fillInput.focus();

	let checked = false;
	function doCheck(){
		if(checked) return;
		const user = normalize(fillInput.value);
		const correct = normalize(item.a);
		if(!user){ fillHint.textContent='Bạn chưa nhập đáp án'; fillHint.style.color='#FF0404'; return; }
		if(user===correct){ fillInput.classList.add('correct'); fillHint.textContent='Chính xác!'; fillHint.style.color='#2F80ED'; }
		else { fillInput.classList.add('incorrect'); fillHint.textContent=`Đáp án đúng: ${item.a}`; fillHint.style.color='#FF0404'; }
		fillInput.disabled = true;
		checked = true;
		fillCheckBtn.classList.add('kt-hidden');
		fillNextBtn.classList.remove('kt-hidden');
	}
	fillCheckBtn.onclick = doCheck;
	fillInput.onkeydown = (e)=>{ if(e.key==='Enter'){ e.preventDefault(); doCheck(); } };
	fillNextBtn.onclick = next;
}

function render(){
	updateProgress();
	const item = DECK[index];
	if(item.type === 'mcq') renderMCQ(item);
	else renderFill(item);
}

function next(){
	index++;
	if(index < KT_TOTAL){
		render();
	} else {
		window.location.href = 'user_ontap_ketqua.html';
	}
}

// Init
render();
