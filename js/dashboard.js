/**
 * Morning Garden Diary - Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Authentication Check
    const currentUser = StorageManager.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // --- State Variables ---
    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth(); // 0-indexed (0: Jan ~ 11: Dec)
    let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let currentDiaryPhotos = [];
    let currentDiaryTags = [];
    let selectedWeather = 'sunny';
    let currentActiveTab = 'dashboard'; // 'dashboard' | 'journal'
    let journalSearchQuery = '';

    // --- DOM Elements ---
    // Navigation & Tabs
    const tabDashboardBtn = document.getElementById('tab-dashboard-btn');
    const tabJournalBtn = document.getElementById('tab-journal-btn');
    const dashboardView = document.getElementById('dashboard-view');
    const journalView = document.getElementById('journal-view');
    const navBrandLogo = document.getElementById('nav-brand-logo');

    // Profile Elements
    const userProfileName = document.getElementById('user-profile-name');
    const userProfileBio = document.getElementById('user-profile-bio');
    const userProfileTags = document.getElementById('user-profile-tags');
    const modalUserName = document.getElementById('modal-user-name');
    const modalUserEmail = document.getElementById('modal-user-email');
    const profileMenu = document.getElementById('profile-menu');
    const profileAvatar = document.getElementById('profile-avatar');

    // Profile Edit Modal Elements
    const profileEditModal = document.getElementById('profile-edit-modal');
    const profileEditForm = document.getElementById('profile-edit-form');
    const editNameInput = document.getElementById('edit-name-input');
    const editBioInput = document.getElementById('edit-bio-input');
    const editTagsInput = document.getElementById('edit-tags-input');

    // Clock Elements
    const digitalClock = document.getElementById('digital-clock');
    const dateDisplay = document.getElementById('date-display');

    // Calendar Elements
    const calendarTitle = document.getElementById('calendar-title');
    const calendarDaysGrid = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const todayJumpBtn = document.getElementById('today-jump-btn');

    // Todo Elements
    const todoTitle = document.getElementById('todo-title');
    const todoListContainer = document.getElementById('todo-list-container');
    const newTodoInput = document.getElementById('new-todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');

    // YouTube Elements
    const youtubeContainer = document.getElementById('youtube-container');
    const youtubeInput = document.getElementById('youtube-input');
    const youtubeExternalLink = document.getElementById('youtube-external-link');

    // Journal Archive Elements
    const journalTotalCount = document.getElementById('journal-total-count');
    const journalSearchInput = document.getElementById('journal-search-input');
    const journalNewEntryBtn = document.getElementById('journal-new-entry-btn');
    const journalEntriesGrid = document.getElementById('journal-entries-grid');
    const journalEmptyState = document.getElementById('journal-empty-state');

    // Side Panel (Entry Editor) Elements
    const entryPanel = document.getElementById('entry-panel');
    const panelOverlay = document.getElementById('panel-overlay');
    const panelDate = document.getElementById('panel-date');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const weatherBtns = document.querySelectorAll('.weather-btn');
    const diaryTitleInput = document.getElementById('diary-title-input');
    const diaryContentTextarea = document.getElementById('diary-content-textarea');
    const photoUploadInput = document.getElementById('photo-upload-input');
    const photoPreviewList = document.getElementById('photo-preview-list');
    const photoCountDisplay = document.getElementById('photo-count-display');
    const hashtagListContainer = document.getElementById('hashtag-list-container');
    const hashtagCountDisplay = document.getElementById('hashtag-count-display');
    const saveEntryBtn = document.getElementById('save-entry-btn');
    const deleteEntryBtn = document.getElementById('delete-entry-btn');

    // Other Modals
    const myInfoModal = document.getElementById('my-info-modal');
    const logoutModal = document.getElementById('logout-modal');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

    // --- Helper Functions ---
    function formatDateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function formatFriendlyDate(date) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    function getWeatherInfo(weatherType) {
        switch (weatherType) {
            case 'cloudy':
                return { icon: 'cloud', label: '흐림', color: 'bg-surface-container-highest text-on-surface-variant' };
            case 'rainy':
                return { icon: 'rainy', label: '비', color: 'bg-surface-container-highest text-primary' };
            case 'sunny':
            default:
                return { icon: 'sunny', label: '맑음', color: 'bg-primary-container text-on-primary-container' };
        }
    }

    // --- Toast Notification ---
    function showToast(message, type = 'info') {
        let toast = document.getElementById('dashboard-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'dashboard-toast';
            toast.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3.5 rounded-full text-body-md font-bold cloud-shadow transition-all duration-300 pointer-events-none flex items-center gap-2.5 shadow-xl';
            document.body.appendChild(toast);
        }

        const isError = type === 'error';
        const isSuccess = type === 'success';

        toast.className = `fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3.5 rounded-full text-body-md font-bold cloud-shadow transition-all duration-300 pointer-events-none flex items-center gap-2.5 shadow-xl ${
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
        }, 2800);
    }

    // --- 2. Profile Management & Edit ---
    function renderUserProfile() {
        const profile = StorageManager.getProfile(currentUser.email);
        
        if (userProfileName) userProfileName.textContent = profile.name || currentUser.name;
        if (modalUserName) modalUserName.textContent = profile.name || currentUser.name;
        if (modalUserEmail) modalUserEmail.textContent = currentUser.email;
        if (userProfileBio) userProfileBio.textContent = profile.bio || '나를 한 줄로 소개해보세요 🌱';

        if (userProfileTags) {
            const tags = Array.isArray(profile.tags) ? profile.tags : ['#MorningPerson', '#GardenLover'];
            userProfileTags.innerHTML = tags.map(tag => {
                const formatted = tag.startsWith('#') ? tag : '#' + tag;
                return `<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-xs font-bold">${formatted}</span>`;
            }).join('');
        }
    }

    window.openProfileEditModal = function() {
        if (profileMenu) profileMenu.classList.add('hidden');
        const profile = StorageManager.getProfile(currentUser.email);

        if (editNameInput) editNameInput.value = profile.name || currentUser.name;
        if (editBioInput) editBioInput.value = profile.bio || '';
        if (editTagsInput) {
            const tags = Array.isArray(profile.tags) ? profile.tags : ['#MorningPerson', '#GardenLover'];
            editTagsInput.value = tags.join(', ');
        }

        if (profileEditModal) {
            profileEditModal.classList.remove('hidden');
            setTimeout(() => {
                profileEditModal.firstElementChild.classList.remove('scale-95');
                profileEditModal.firstElementChild.classList.add('scale-100');
                if (editNameInput) editNameInput.focus();
            }, 10);
        }
    };

    window.closeProfileEditModal = function() {
        if (profileEditModal) {
            profileEditModal.firstElementChild.classList.remove('scale-100');
            profileEditModal.firstElementChild.classList.add('scale-95');
            setTimeout(() => {
                profileEditModal.classList.add('hidden');
            }, 180);
        }
    };

    if (profileEditForm) {
        profileEditForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = editNameInput.value.trim();
            const bio = editBioInput.value.trim();
            const tagsRaw = editTagsInput.value.trim();

            if (!name) {
                showToast('이름을 입력해주세요.', 'error');
                return;
            }

            const tags = tagsRaw
                ? tagsRaw.split(',').map(t => t.trim()).filter(t => t.length > 0).map(t => t.startsWith('#') ? t : '#' + t)
                : ['#MorningPerson', '#GardenLover'];

            StorageManager.saveProfile(currentUser.email, { name, bio, tags });
            renderUserProfile();
            closeProfileEditModal();
            showToast('프로필이 성공적으로 저장되었습니다 🌱', 'success');
        });
    }

    // --- 3. Tab Switching (Dashboard vs Journal) ---
    function switchTab(tab) {
        currentActiveTab = tab;
        if (tab === 'journal') {
            tabJournalBtn.className = 'px-5 py-2 rounded-full font-headline-md text-[17px] transition-all duration-200 bg-primary-container text-on-primary-container font-bold shadow-sm flex items-center gap-1.5 cursor-pointer';
            tabDashboardBtn.className = 'px-5 py-2 rounded-full font-headline-md text-[17px] transition-all duration-200 text-on-surface-variant hover:text-primary font-medium flex items-center gap-1.5 cursor-pointer';
            
            dashboardView.classList.add('hidden');
            journalView.classList.remove('hidden');
            renderJournalView();
        } else {
            tabDashboardBtn.className = 'px-5 py-2 rounded-full font-headline-md text-[17px] transition-all duration-200 bg-primary-container text-on-primary-container font-bold shadow-sm flex items-center gap-1.5 cursor-pointer';
            tabJournalBtn.className = 'px-5 py-2 rounded-full font-headline-md text-[17px] transition-all duration-200 text-on-surface-variant hover:text-primary font-medium flex items-center gap-1.5 cursor-pointer';
            
            journalView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            renderCalendar();
            renderTodoList();
        }
    }

    if (tabDashboardBtn) tabDashboardBtn.addEventListener('click', () => switchTab('dashboard'));
    if (tabJournalBtn) tabJournalBtn.addEventListener('click', () => switchTab('journal'));
    if (navBrandLogo) navBrandLogo.addEventListener('click', () => switchTab('dashboard'));

    // --- 4. Realtime Digital Clock ---
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        if (digitalClock) digitalClock.textContent = `${hours}:${minutes} ${ampm}`;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (dateDisplay) {
            dateDisplay.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- 5. Interactive Monthly Calendar ---
    function renderCalendar() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (calendarTitle) {
            calendarTitle.textContent = `${months[currentMonth]} ${currentYear}`;
        }

        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0: Sunday
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const diaries = StorageManager.getDiaries(currentUser.email);
        const allTodos = StorageManager.getAllTodos(currentUser.email);

        calendarDaysGrid.innerHTML = '';

        // Empty padding cells before the 1st day of month
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'aspect-square';
            calendarDaysGrid.appendChild(emptyCell);
        }

        const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

        // Render days
        for (let day = 1; day <= lastDayOfMonth; day++) {
            const dayDate = new Date(currentYear, currentMonth, day);
            const dateKey = formatDateKey(dayDate);
            const isToday = isCurrentMonth && day === today.getDate();
            const isSelected = formatDateKey(selectedDate) === dateKey;
            
            const hasDiary = !!diaries[dateKey];
            const todosForDate = allTodos[dateKey] || [];
            const hasTodos = todosForDate.length > 0;
            const allTodosDone = hasTodos && todosForDate.every(t => t.completed);

            const dayCell = document.createElement('div');
            dayCell.className = `aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 font-body-md text-body-md relative group select-none ${
                isSelected
                    ? 'bg-primary text-on-primary ring-2 ring-primary-container ring-offset-2 ring-offset-background font-bold shadow-md scale-105'
                    : isToday
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm hover:scale-105'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-highest hover:scale-105'
            }`;

            // Day Number
            const numSpan = document.createElement('span');
            numSpan.textContent = day;
            numSpan.className = 'text-[15px] font-bold';
            dayCell.appendChild(numSpan);

            // Indicators Container (Diary dot + Todo dot)
            const indicatorContainer = document.createElement('div');
            indicatorContainer.className = 'flex items-center gap-1 absolute bottom-2';

            if (hasDiary) {
                const diaryDot = document.createElement('span');
                diaryDot.className = `w-2 h-2 rounded-full ${isSelected ? 'bg-secondary-fixed' : 'bg-secondary'}`;
                diaryDot.title = '일기 작성됨';
                indicatorContainer.appendChild(diaryDot);
            }

            if (hasTodos) {
                const todoDot = document.createElement('span');
                todoDot.className = `w-2 h-2 rounded-full ${
                    allTodosDone 
                        ? (isSelected ? 'bg-primary-fixed' : 'bg-primary-container') 
                        : (isSelected ? 'bg-surface-container-lowest' : 'bg-outline')
                }`;
                todoDot.title = allTodosDone ? '할 일 모두 완료' : '할 일 있음';
                indicatorContainer.appendChild(todoDot);
            }

            dayCell.appendChild(indicatorContainer);

            // Click Handler: select date and open entry editor panel
            dayCell.addEventListener('click', () => {
                selectedDate = new Date(currentYear, currentMonth, day);
                renderCalendar();
                renderTodoList();
                openEntryPanel(selectedDate);
            });

            calendarDaysGrid.appendChild(dayCell);
        }
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }

    if (todayJumpBtn) {
        todayJumpBtn.addEventListener('click', () => {
            currentYear = today.getFullYear();
            currentMonth = today.getMonth();
            selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            renderCalendar();
            renderTodoList();
            showToast('오늘 날짜로 이동했습니다 🌿', 'info');
        });
    }

    // --- 6. Date-Specific To-Do List ---
    function renderTodoList() {
        const dateKey = formatDateKey(selectedDate);
        const isToday = formatDateKey(today) === dateKey;
        
        if (todoTitle) {
            const formatted = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
            todoTitle.innerHTML = `${isToday ? '오늘' : formatted} 할 일을 관리해볼까요? 🌱`;
        }

        const todos = StorageManager.getTodosByDate(currentUser.email, dateKey);
        todoListContainer.innerHTML = '';

        if (todos.length === 0) {
            todoListContainer.innerHTML = `
                <div class="text-center py-8 text-on-surface-variant/60 font-body-md">
                    <span class="material-symbols-outlined text-3xl mb-1 text-outline-variant">spa</span>
                    <p class="text-xs">등록된 할 일이 없습니다.</p>
                </div>
            `;
            return;
        }

        todos.forEach(todo => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between gap-3 group py-1.5 px-2 rounded-xl hover:bg-surface-container-low/50 transition-colors';

            const left = document.createElement('label');
            left.className = 'flex items-center gap-3 cursor-pointer flex-grow overflow-hidden';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.className = 'w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-background bg-surface-container-low cursor-pointer';
            
            checkbox.addEventListener('change', () => {
                StorageManager.toggleTodo(currentUser.email, dateKey, todo.id);
                renderTodoList();
                renderCalendar();
            });

            const textSpan = document.createElement('span');
            textSpan.className = `font-body-md text-sm break-all transition-colors ${
                todo.completed ? 'text-on-surface-variant line-through opacity-60' : 'text-on-surface group-hover:text-primary'
            }`;
            textSpan.textContent = todo.text;

            left.appendChild(checkbox);
            left.appendChild(textSpan);

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'text-outline hover:text-error transition-colors p-1 opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-pointer rounded-full hover:bg-surface-container-highest';
            deleteBtn.title = '삭제';
            deleteBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">close</span>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                StorageManager.deleteTodo(currentUser.email, dateKey, todo.id);
                renderTodoList();
                renderCalendar();
            });

            item.appendChild(left);
            item.appendChild(deleteBtn);
            todoListContainer.appendChild(item);
        });
    }

    function handleAddTodo() {
        const text = newTodoInput.value.trim();
        if (!text) return;

        const dateKey = formatDateKey(selectedDate);
        StorageManager.addTodo(currentUser.email, dateKey, text);
        newTodoInput.value = '';
        renderTodoList();
        renderCalendar();
    }

    if (addTodoBtn) addTodoBtn.addEventListener('click', handleAddTodo);
    if (newTodoInput) {
        newTodoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAddTodo();
        });
    }

    // --- 7. YouTube Player Integration ---
    function extractYoutubeVideoId(url) {
        if (!url) return null;
        url = url.trim();
        
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return url;
        }
        
        try {
            const urlToParse = url.startsWith('http') ? url : 'https://' + url;
            const parsed = new URL(urlToParse);
            
            if (parsed.searchParams.has('v')) {
                const v = parsed.searchParams.get('v');
                if (v && v.length === 11) return v;
            }
            if (parsed.hostname.includes('youtu.be')) {
                const id = parsed.pathname.replace(/^\/+/, '').split('?')[0].split('/')[0];
                if (id && id.length === 11) return id;
            }
            if (parsed.pathname.includes('/embed/')) {
                const id = parsed.pathname.split('/embed/')[1].split('?')[0].split('/')[0];
                if (id && id.length === 11) return id;
            }
            if (parsed.pathname.includes('/shorts/')) {
                const id = parsed.pathname.split('/shorts/')[1].split('?')[0].split('/')[0];
                if (id && id.length === 11) return id;
            }
            if (parsed.pathname.includes('/live/')) {
                const id = parsed.pathname.split('/live/')[1].split('?')[0].split('/')[0];
                if (id && id.length === 11) return id;
            }
        } catch (e) {}

        const regExp = /(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regExp);
        return match ? match[1] : null;
    }

    function renderYoutubePlayer(url) {
        const videoId = extractYoutubeVideoId(url);

        if (videoId) {
            if (youtubeExternalLink) {
                youtubeExternalLink.href = `https://www.youtube.com/watch?v=${videoId}`;
                youtubeExternalLink.classList.remove('hidden');
            }

            youtubeContainer.innerHTML = `
                <iframe 
                    class="w-full h-full rounded-xl" 
                    src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&enablejsapi=0" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerpolicy="no-referrer-when-downgrade"
                    allowfullscreen>
                </iframe>
            `;
        } else {
            if (youtubeExternalLink) {
                youtubeExternalLink.classList.add('hidden');
            }
            youtubeContainer.innerHTML = `
                <img class="w-full h-full object-cover" 
                     src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwH3eShYmyKLpKdebBEp56cVgUaxjzRemROe6a_cSX6vKscBpoJAx-WFpfHMdv9ck-4yRHP96E7-VZfxHsM2V_KRdpjZX8O6oy2uy1wwCXLczdbfT-2_ihy5HU1lPWM4UZlJI8oPl4ymVa4slPJ27X_otPqECHGrMct8k1V15JYNM-0sUXyLgm2oHhmOSrrSjXn8PLERmLfpomgNi42L0F2CLrUpD9TPewCUqlvyxn07sJQ8PJGFiE" 
                     alt="Morning Vibes thumbnail"/>
                <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-white text-4xl">play_arrow</span>
                </div>
            `;
        }
    }

    function initYoutube() {
        const savedUrl = StorageManager.getYoutubeUrl(currentUser.email);
        if (savedUrl) {
            if (youtubeInput) youtubeInput.value = savedUrl;
            renderYoutubePlayer(savedUrl);
        } else {
            renderYoutubePlayer('');
        }

        if (youtubeInput) {
            youtubeInput.addEventListener('change', () => {
                const url = youtubeInput.value.trim();
                StorageManager.saveYoutubeUrl(currentUser.email, url);
                renderYoutubePlayer(url);
                if (url) showToast('음악 영상이 설정되었습니다 🎵', 'success');
            });
            youtubeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    youtubeInput.blur();
                }
            });
        }
    }

    // --- 8. Journal Entry Slide Panel (Editor) ---
    window.openEntryPanel = function(date) {
        selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dateKey = formatDateKey(selectedDate);
        if (panelDate) panelDate.textContent = formatFriendlyDate(selectedDate);

        // Load existing diary data or defaults
        const diary = StorageManager.getDiary(currentUser.email, dateKey);
        if (diary) {
            selectedWeather = diary.weather || 'sunny';
            if (diaryTitleInput) diaryTitleInput.value = diary.title || '';
            if (diaryContentTextarea) diaryContentTextarea.value = diary.content || '';
            currentDiaryPhotos = diary.photos ? [...diary.photos] : [];
            currentDiaryTags = diary.hashtags ? [...diary.hashtags] : [];
            if (deleteEntryBtn) deleteEntryBtn.classList.remove('hidden');
        } else {
            selectedWeather = 'sunny';
            if (diaryTitleInput) diaryTitleInput.value = '';
            if (diaryContentTextarea) diaryContentTextarea.value = '';
            currentDiaryPhotos = [];
            currentDiaryTags = ['#Morning', '#Garden'];
            if (deleteEntryBtn) deleteEntryBtn.classList.add('hidden');
        }

        updateWeatherUI();
        renderPhotoPreviews();
        renderHashtags();

        // Slide in
        if (entryPanel) entryPanel.classList.remove('translate-x-full');
        if (panelOverlay) panelOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    window.closeEntryPanel = function() {
        if (entryPanel) entryPanel.classList.add('translate-x-full');
        if (panelOverlay) panelOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    };

    // Weather Selection UI
    function updateWeatherUI() {
        weatherBtns.forEach(btn => {
            const w = btn.getAttribute('data-weather');
            if (w === selectedWeather) {
                btn.className = 'weather-btn w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md';
            } else {
                btn.className = 'weather-btn w-12 h-12 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:scale-110 transition-transform cursor-pointer';
            }
        });
    }

    weatherBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedWeather = btn.getAttribute('data-weather');
            updateWeatherUI();
        });
    });

    // Photo Upload (FileReader -> Base64)
    function renderPhotoPreviews() {
        if (photoCountDisplay) photoCountDisplay.textContent = `${currentDiaryPhotos.length}/5`;
        photoPreviewList.innerHTML = '';

        // Add Photo Button Item
        if (currentDiaryPhotos.length < 5) {
            const addBtnWrapper = document.createElement('button');
            addBtnWrapper.type = 'button';
            addBtnWrapper.className = 'min-w-[100px] w-[100px] h-[100px] rounded-2xl bg-surface-container-low border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors flex-shrink-0 cursor-pointer';
            addBtnWrapper.innerHTML = `
                <span class="material-symbols-outlined mb-1 text-2xl">add_photo_alternate</span>
                <span class="font-label-sm text-xs">Add</span>
            `;
            addBtnWrapper.addEventListener('click', () => {
                if (photoUploadInput) photoUploadInput.click();
            });
            photoPreviewList.appendChild(addBtnWrapper);
        }

        // Preview Existing Photos
        currentDiaryPhotos.forEach((photoSrc, idx) => {
            const card = document.createElement('div');
            card.className = 'min-w-[100px] w-[100px] h-[100px] rounded-2xl relative overflow-hidden flex-shrink-0 cloud-shadow group border border-outline-variant/30';

            const img = document.createElement('img');
            img.src = photoSrc;
            img.className = 'w-full h-full object-cover';
            img.alt = `Diary Photo ${idx + 1}`;

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error cursor-pointer';
            delBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">close</span>';
            delBtn.title = '사진 삭제';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentDiaryPhotos.splice(idx, 1);
                renderPhotoPreviews();
            });

            card.appendChild(img);
            card.appendChild(delBtn);
            photoPreviewList.appendChild(card);
        });
    }

    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (!files.length) return;

            const remaining = 5 - currentDiaryPhotos.length;
            if (remaining <= 0) {
                showToast('사진은 최대 5장까지 등록할 수 있습니다.', 'error');
                return;
            }

            const filesToProcess = files.slice(0, remaining);
            let processed = 0;

            filesToProcess.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentDiaryPhotos.push(event.target.result);
                    processed++;
                    if (processed === filesToProcess.length) {
                        renderPhotoPreviews();
                        photoUploadInput.value = '';
                    }
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Hashtags
    function renderHashtags() {
        if (hashtagCountDisplay) hashtagCountDisplay.textContent = `${currentDiaryTags.length}/20`;
        hashtagListContainer.innerHTML = '';

        currentDiaryTags.forEach((tag, idx) => {
            const chip = document.createElement('span');
            chip.className = 'bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full font-label-sm text-xs flex items-center gap-1 shadow-sm font-bold';
            chip.innerHTML = `
                <span>${tag.startsWith('#') ? tag : '#' + tag}</span>
                <span class="material-symbols-outlined text-[14px] cursor-pointer hover:text-error transition-colors">close</span>
            `;
            chip.querySelector('.material-symbols-outlined').addEventListener('click', () => {
                currentDiaryTags.splice(idx, 1);
                renderHashtags();
            });
            hashtagListContainer.appendChild(chip);
        });

        // Add Tag Input
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'inline-block';
        const tagInput = document.createElement('input');
        tagInput.className = 'bg-surface-container-low border-none rounded-full px-4 py-1.5 font-label-sm text-xs focus:ring-2 focus:ring-primary w-28 text-on-surface placeholder:text-outline-variant';
        tagInput.placeholder = '+ Add tag';
        tagInput.type = 'text';

        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                let val = tagInput.value.trim();
                if (!val) return;
                if (!val.startsWith('#')) val = '#' + val;
                if (!currentDiaryTags.includes(val) && currentDiaryTags.length < 20) {
                    currentDiaryTags.push(val);
                    renderHashtags();
                } else if (currentDiaryTags.length >= 20) {
                    showToast('해시태그는 최대 20개까지 추가 가능합니다.', 'error');
                }
            }
        });

        inputWrapper.appendChild(tagInput);
        hashtagListContainer.appendChild(inputWrapper);
    }

    // Save Diary Entry
    if (saveEntryBtn) {
        saveEntryBtn.addEventListener('click', () => {
            const dateKey = formatDateKey(selectedDate);
            const title = diaryTitleInput.value.trim();
            const content = diaryContentTextarea.value.trim();

            if (!title && !content && currentDiaryPhotos.length === 0) {
                showToast('제목 또는 내용을 입력해주세요.', 'error');
                return;
            }

            const diaryData = {
                date: dateKey,
                weather: selectedWeather,
                title: title,
                content: content,
                photos: currentDiaryPhotos,
                hashtags: currentDiaryTags
            };

            StorageManager.saveDiary(currentUser.email, dateKey, diaryData);
            showToast('일기가 포근하게 저장되었습니다 🌱', 'success');
            
            renderCalendar();
            if (currentActiveTab === 'journal') {
                renderJournalView();
            }
            closeEntryPanel();
        });
    }

    // Delete Diary Entry
    if (deleteEntryBtn) {
        deleteEntryBtn.addEventListener('click', () => {
            const dateKey = formatDateKey(selectedDate);
            if (confirm('정말 이 일기를 삭제하시겠습니까?')) {
                StorageManager.deleteDiary(currentUser.email, dateKey);
                showToast('일기가 삭제되었습니다.', 'info');
                renderCalendar();
                if (currentActiveTab === 'journal') {
                    renderJournalView();
                }
                closeEntryPanel();
            }
        });
    }

    if (closePanelBtn) closePanelBtn.addEventListener('click', closeEntryPanel);
    if (panelOverlay) panelOverlay.addEventListener('click', closeEntryPanel);

    // --- 9. Journal Archive Feed View ---
    function renderJournalView() {
        const allDiaries = StorageManager.getAllDiariesList(currentUser.email);
        
        // Filter by Search Query
        const filtered = allDiaries.filter(d => {
            if (!journalSearchQuery) return true;
            const q = journalSearchQuery.toLowerCase();
            const titleMatch = (d.title || '').toLowerCase().includes(q);
            const contentMatch = (d.content || '').toLowerCase().includes(q);
            const tagsMatch = (d.hashtags || []).some(t => t.toLowerCase().includes(q));
            const dateMatch = (d.date || '').includes(q);
            return titleMatch || contentMatch || tagsMatch || dateMatch;
        });

        if (journalTotalCount) {
            journalTotalCount.textContent = `${filtered.length} Entries`;
        }

        journalEntriesGrid.innerHTML = '';

        if (filtered.length === 0) {
            journalEmptyState.classList.remove('hidden');
            journalEmptyState.classList.add('flex');
            journalEntriesGrid.classList.add('hidden');
            return;
        } else {
            journalEmptyState.classList.add('hidden');
            journalEmptyState.classList.remove('flex');
            journalEntriesGrid.classList.remove('hidden');
        }

        filtered.forEach(diary => {
            const entryDate = new Date(diary.date);
            const weather = getWeatherInfo(diary.weather);

            const card = document.createElement('div');
            card.className = 'bg-surface-container-lowest rounded-2xl p-6 cloud-shadow hover-lift border border-outline-variant/20 flex flex-col justify-between transition-all duration-200 cursor-pointer group';

            // Top metadata (Date + Weather)
            const topMeta = document.createElement('div');
            topMeta.className = 'flex justify-between items-center mb-4';
            topMeta.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="bg-surface-container-low text-primary font-bold px-3 py-1 rounded-full text-xs">
                        ${formatFriendlyDate(entryDate)}
                    </span>
                </div>
                <div class="flex items-center gap-1.5 ${weather.color} px-2.5 py-1 rounded-full text-xs font-bold">
                    <span class="material-symbols-outlined text-[16px]">${weather.icon}</span>
                    <span>${weather.label}</span>
                </div>
            `;

            // Photo Preview Carousel (if any)
            let photoSection = '';
            if (diary.photos && diary.photos.length > 0) {
                photoSection = `
                    <div class="mb-4 rounded-xl overflow-hidden aspect-video bg-surface-container-low relative">
                        <img src="${diary.photos[0]}" alt="Diary Photo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                        ${diary.photos.length > 1 ? `<span class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">+${diary.photos.length - 1}</span>` : ''}
                    </div>
                `;
            }

            // Body (Title + Snippet)
            const titleText = diary.title || '무제';
            const snippet = diary.content 
                ? (diary.content.length > 110 ? diary.content.substring(0, 110) + '...' : diary.content) 
                : '기록된 내용이 없습니다.';

            const bodyContent = document.createElement('div');
            bodyContent.className = 'flex-grow';
            bodyContent.innerHTML = `
                ${photoSection}
                <h3 class="font-headline-md text-lg text-primary font-bold mb-2 group-hover:text-primary-container transition-colors line-clamp-1">${titleText}</h3>
                <p class="font-body-md text-sm text-on-surface-variant leading-relaxed mb-4 whitespace-pre-line">${snippet}</p>
            `;

            // Tags
            const tagsWrapper = document.createElement('div');
            tagsWrapper.className = 'flex flex-wrap gap-1.5 mb-4';
            if (diary.hashtags && diary.hashtags.length > 0) {
                tagsWrapper.innerHTML = diary.hashtags.slice(0, 4).map(t => 
                    `<span class="bg-secondary-container/70 text-on-secondary-container px-2.5 py-0.5 rounded-full text-[11px] font-bold">${t}</span>`
                ).join('');
            }

            // Footer (Open button)
            const cardFooter = document.createElement('div');
            cardFooter.className = 'pt-3 border-t border-surface-container-highest border-dashed flex justify-between items-center text-xs text-primary font-bold';
            cardFooter.innerHTML = `
                <span class="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>일기 열기 &amp; 수정</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
            `;

            card.appendChild(topMeta);
            card.appendChild(bodyContent);
            card.appendChild(tagsWrapper);
            card.appendChild(cardFooter);

            card.addEventListener('click', () => {
                openEntryPanel(entryDate);
            });

            journalEntriesGrid.appendChild(card);
        });
    }

    if (journalSearchInput) {
        journalSearchInput.addEventListener('input', (e) => {
            journalSearchQuery = e.target.value.trim();
            renderJournalView();
        });
    }

    if (journalNewEntryBtn) {
        journalNewEntryBtn.addEventListener('click', () => {
            openEntryPanel(new Date());
        });
    }

    // --- 10. Profile Dropdown & Other Modals ---
    window.toggleProfileMenu = function() {
        if (profileMenu) profileMenu.classList.toggle('hidden');
    };

    document.addEventListener('click', (e) => {
        if (profileAvatar && profileMenu && !profileAvatar.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.classList.add('hidden');
        }
    });

    window.openMyInfoModal = function() {
        if (profileMenu) profileMenu.classList.add('hidden');
        if (myInfoModal) {
            myInfoModal.classList.remove('hidden');
            setTimeout(() => {
                myInfoModal.firstElementChild.classList.remove('scale-95');
                myInfoModal.firstElementChild.classList.add('scale-100');
            }, 10);
        }
    };

    window.closeMyInfoModal = function() {
        if (myInfoModal) {
            myInfoModal.firstElementChild.classList.remove('scale-100');
            myInfoModal.firstElementChild.classList.add('scale-95');
            setTimeout(() => {
                myInfoModal.classList.add('hidden');
            }, 180);
        }
    };

    window.openLogoutModal = function() {
        if (profileMenu) profileMenu.classList.add('hidden');
        if (logoutModal) {
            logoutModal.classList.remove('hidden');
            setTimeout(() => {
                logoutModal.firstElementChild.classList.remove('scale-95');
                logoutModal.firstElementChild.classList.add('scale-100');
            }, 10);
        }
    };

    window.closeLogoutModal = function() {
        if (logoutModal) {
            logoutModal.firstElementChild.classList.remove('scale-100');
            logoutModal.firstElementChild.classList.add('scale-95');
            setTimeout(() => {
                logoutModal.classList.add('hidden');
            }, 180);
        }
    };

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            StorageManager.logout();
            window.location.href = 'index.html';
        });
    }

    // --- 11. Initial Application Setup ---
    renderUserProfile();
    renderCalendar();
    renderTodoList();
    initYoutube();
});
