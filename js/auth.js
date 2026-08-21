/**
 * Morning Garden Diary - Auth SPA Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginCard = document.getElementById('login-card');
    const signupCard = document.getElementById('signup-card');
    const goToSignupBtn = document.getElementById('go-to-signup');
    const goToLoginBtn = document.getElementById('go-to-login');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const toggleLoginPassword = document.getElementById('toggle-login-password');

    const signupNameInput = document.getElementById('signup-name');
    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const toggleSignupPassword = document.getElementById('toggle-signup-password');

    // 이미 로그인된 사용자가 있다면 세션 이메일 자동 채우기
    const currentUser = StorageManager.getCurrentUser();
    if (currentUser && loginEmailInput) {
        loginEmailInput.value = currentUser.email;
    }

    // --- SPA 화면 전환 ---
    function showView(view) {
        if (view === 'signup') {
            loginCard.classList.add('hidden');
            signupCard.classList.remove('hidden');
            signupCard.classList.remove('animate-fadeIn');
            void signupCard.offsetWidth; // reflow
            signupCard.classList.add('animate-fadeIn');
            document.title = 'Morning Garden Diary - Sign Up';
            if (signupNameInput) signupNameInput.focus();
        } else {
            signupCard.classList.add('hidden');
            loginCard.classList.remove('hidden');
            loginCard.classList.remove('animate-fadeIn');
            void loginCard.offsetWidth; // reflow
            loginCard.classList.add('animate-fadeIn');
            document.title = 'Morning Garden Diary - Login';
            if (loginEmailInput) loginEmailInput.focus();
        }
    }

    if (goToSignupBtn) {
        goToSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showView('signup');
        });
    }

    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showView('login');
        });
    }

    // --- 비밀번호 보기/숨기기 토글 ---
    function setupPasswordToggle(button, input) {
        if (!button || !input) return;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            const icon = button.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = isPassword ? 'visibility_off' : 'visibility';
            }
        });
    }

    setupPasswordToggle(toggleLoginPassword, loginPasswordInput);
    setupPasswordToggle(toggleSignupPassword, signupPasswordInput);

    // --- 토스트 알림 함수 ---
    function showToast(message, type = 'info') {
        let toast = document.getElementById('garden-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'garden-toast';
            toast.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3.5 rounded-full text-body-md font-bold cloud-shadow transition-all duration-300 pointer-events-none flex items-center gap-2.5 shadow-lg';
            document.body.appendChild(toast);
        }

        const isError = type === 'error';
        const isSuccess = type === 'success';

        toast.className = `fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3.5 rounded-full text-body-md font-bold cloud-shadow transition-all duration-300 pointer-events-none flex items-center gap-2.5 shadow-lg ${
            isError ? 'bg-error text-on-error' : isSuccess ? 'bg-secondary text-on-secondary' : 'bg-primary-container text-on-primary-container'
        }`;

        const iconName = isError ? 'error' : isSuccess ? 'check_circle' : 'spa';
        toast.innerHTML = `<span class="material-symbols-outlined text-[22px]">${iconName}</span><span>${message}</span>`;

        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, 0)';

        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 10px)';
        }, 3000);
    }

    // --- 회원가입 제출 처리 ---
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = signupNameInput.value.trim();
            const email = signupEmailInput.value.trim();
            const password = signupPasswordInput.value;

            if (!name || !email || !password) {
                showToast('모든 항목을 입력해주세요.', 'error');
                return;
            }

            if (password.length < 4) {
                showToast('비밀번호는 4자리 이상이어야 합니다.', 'error');
                return;
            }

            const result = StorageManager.registerUser(name, email, password);
            if (!result.success) {
                showToast(result.message, 'error');
                return;
            }

            showToast('회원가입이 완료되었습니다! 로그인해주세요. 🌿', 'success');
            signupForm.reset();
            
            // 로그인 폼에 가입된 이메일 자동 채우기
            if (loginEmailInput) loginEmailInput.value = email;
            if (loginPasswordInput) loginPasswordInput.value = '';
            
            // 로그인 화면으로 전환
            setTimeout(() => {
                showView('login');
                if (loginPasswordInput) loginPasswordInput.focus();
            }, 600);
        });
    }

    // --- 로그인 제출 처리 ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginEmailInput.value.trim();
            const password = loginPasswordInput.value;

            if (!email || !password) {
                showToast('이메일과 비밀번호를 입력해주세요.', 'error');
                return;
            }

            const result = StorageManager.authenticateUser(email, password);
            if (!result.success) {
                showToast(result.message, 'error');
                return;
            }

            showToast(`환영합니다, ${result.user.name}님! 🌱`, 'success');
            
            // 대시보드로 부드럽게 이동
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        });
    }
});
