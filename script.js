function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

let likesCount = 0;
let dislikesCount = 0;
let comments = [];

const likeBtn = document.getElementById('like-btn');
const dislikeBtn = document.getElementById('dislike-btn');
const likeCountSpan = document.getElementById('like-count');
const dislikeCountSpan = document.getElementById('dislike-count');

const commentInput = document.getElementById('comment-input');
const submitCommentBtn = document.getElementById('submit-comment-btn');
const commentsList = document.getElementById('comments-list');

const resetBtn = document.getElementById('reset-btn');
const statusMessage = document.getElementById('status-message');

document.addEventListener('DOMContentLoaded', () => {
    loadStoredState();
    setupEventListeners();
});

function loadStoredState() {
    const savedVote = getCookie('user_vote');
    const savedLikes = getCookie('likes_count');
    const savedDislikes = getCookie('dislikes_count');

    if (savedLikes) likesCount = parseInt(savedLikes, 10) || 0;
    if (savedDislikes) dislikesCount = parseInt(savedDislikes, 10) || 0;

    likeCountSpan.textContent = likesCount;
    dislikeCountSpan.textContent = dislikesCount;

    if (savedVote) {
        disableVoting(`You have already voted (${savedVote.toUpperCase()}).`);
    }

    const savedComments = getCookie('user_comments');
    const hasCommented = getCookie('has_commented');

    if (savedComments) {
        try {
            comments = JSON.parse(savedComments);
        } catch (e) {
            comments = [];
        }
    }

    renderComments();

    if (hasCommented === 'true') {
        disableCommentInput('You have already submitted a comment.');
    }
}

function setupEventListeners() {
    likeBtn.addEventListener('click', () => handleVote('like'));
    dislikeBtn.addEventListener('click', () => handleVote('dislike'));
    submitCommentBtn.addEventListener('click', handleCommentSubmit);
    resetBtn.addEventListener('click', handleReset);
}

function handleVote(type) {
    if (getCookie('user_vote')) return;

    if (type === 'like') {
        likesCount++;
        likeCountSpan.textContent = likesCount;
        setCookie('likes_count', likesCount);
        triggerAnimation(likeBtn);
    } else if (type === 'dislike') {
        dislikesCount++;
        dislikeCountSpan.textContent = dislikesCount;
        setCookie('dislikes_count', dislikesCount);
        triggerAnimation(dislikeBtn);
    }

    setCookie('user_vote', type);
    disableVoting(`Your ${type} has been recorded!`);
}

function disableVoting(message) {
    likeBtn.disabled = true;
    dislikeBtn.disabled = true;
    showStatus(message);
}

function handleCommentSubmit() {
    const text = commentInput.value.trim();
    if (!text) {
        alert('Please enter a valid comment before submitting.');
        return;
    }

    if (getCookie('has_commented') === 'true') {
        alert('You have already submitted a comment!');
        return;
    }

    comments.push(text);
    setCookie('user_comments', JSON.stringify(comments));
    setCookie('has_commented', 'true');

    renderComments();
    commentInput.value = '';
    disableCommentInput('Your comment has been added.');
}

function disableCommentInput(message) {
    commentInput.disabled = true;
    submitCommentBtn.disabled = true;
    showStatus(message);
}

function renderComments() {
    commentsList.innerHTML = '';
    if (comments.length === 0) {
        commentsList.innerHTML = '<li class="empty-msg">No comments yet. Be the first to comment!</li>';
        return;
    }

    comments.forEach(comment => {
        const li = document.createElement('li');
        li.textContent = comment;
        commentsList.appendChild(li);
    });
}

function handleReset() {
    if (!confirm('Are you sure you want to reset all your votes, comments, and clear cookies?')) {
        return;
    }

    deleteCookie('user_vote');
    deleteCookie('likes_count');
    deleteCookie('dislikes_count');
    deleteCookie('user_comments');
    deleteCookie('has_commented');

    likesCount = 0;
    dislikesCount = 0;
    comments = [];

    likeCountSpan.textContent = '0';
    dislikeCountSpan.textContent = '0';

    likeBtn.disabled = false;
    dislikeBtn.disabled = false;

    commentInput.disabled = false;
    commentInput.value = '';
    submitCommentBtn.disabled = false;

    renderComments();
    showStatus('Confirmation: All choices, comments, and cookies have been successfully reset.');
}

function triggerAnimation(element) {
    element.classList.add('animate-pop');
    setTimeout(() => {
        element.classList.remove('animate-pop');
    }, 300);
}

function showStatus(msg) {
    statusMessage.textContent = msg;
    statusMessage.classList.remove('hidden', 'info');
    statusMessage.classList.add('info');
}