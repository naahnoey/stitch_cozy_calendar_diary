/**
 * Morning Garden Diary - LocalStorage Data Manager
 */

const StorageManager = {
    KEYS: {
        USERS: 'garden_users',
        CURRENT_USER: 'garden_current_user',
        DIARIES_PREFIX: 'garden_diaries_',
        TODOS_PREFIX: 'garden_todos_',
        YOUTUBE_PREFIX: 'garden_youtube_',
        PROFILE_PREFIX: 'garden_profile_'
    },

    // --- User Authentication & Session ---
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.USERS)) || [];
        } catch (e) {
            console.error('Failed to get users from localStorage', e);
            return [];
        }
    },

    registerUser(name, email, password) {
        const users = this.getUsers();
        const trimmedEmail = email.trim().toLowerCase();
        
        if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
            return { success: false, message: '이미 등록된 이메일 주소입니다.' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name: name.trim(),
            email: trimmedEmail,
            password: password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));

        // 초기 프로필 및 기본 샘플 데이터 설정
        this.saveProfile(trimmedEmail, {
            name: name.trim(),
            bio: '나를 한 줄로 소개해보세요 🌱',
            tags: ['#MorningPerson', '#GardenLover']
        });

        this.initUserData(trimmedEmail, name.trim());

        return { success: true, user: newUser };
    },

    authenticateUser(email, password) {
        const users = this.getUsers();
        const trimmedEmail = email.trim().toLowerCase();
        const user = users.find(u => u.email.toLowerCase() === trimmedEmail && u.password === password);

        if (user) {
            // 최신 프로필 정보 반영
            const profile = this.getProfile(trimmedEmail);
            const currentUser = { 
                id: user.id, 
                name: profile.name || user.name, 
                email: user.email 
            };
            this.setCurrentUser(currentUser);
            return { success: true, user: currentUser };
        }
        return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    },

    getCurrentUser() {
        try {
            const userStr = localStorage.getItem(this.KEYS.CURRENT_USER);
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    },

    setCurrentUser(user) {
        localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    // --- Profile Management ---
    getProfile(userEmail) {
        const key = this.KEYS.PROFILE_PREFIX + userEmail.toLowerCase();
        try {
            const profileStr = localStorage.getItem(key);
            if (profileStr) return JSON.parse(profileStr);
        } catch (e) {}

        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
        const defaultName = user ? user.name : 'Garden Friend';

        return {
            name: defaultName,
            bio: '나를 한 줄로 소개해보세요 🌱',
            tags: ['#MorningPerson', '#GardenLover']
        };
    },

    saveProfile(userEmail, profileData) {
        const key = this.KEYS.PROFILE_PREFIX + userEmail.toLowerCase();
        const current = this.getProfile(userEmail);
        const updated = {
            ...current,
            ...profileData
        };
        localStorage.setItem(key, JSON.stringify(updated));

        // 세션 현재 사용자 이름도 동기화
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.email.toLowerCase() === userEmail.toLowerCase()) {
            currentUser.name = updated.name;
            this.setCurrentUser(currentUser);
        }

        // 전체 사용자 목록에서도 이름 동기화
        const users = this.getUsers();
        const target = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
        if (target) {
            target.name = updated.name;
            localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
        }

        return updated;
    },

    // --- Diaries (Date-specific YYYY-MM-DD) ---
    getDiaries(userEmail) {
        const key = this.KEYS.DIARIES_PREFIX + userEmail.toLowerCase();
        try {
            return JSON.parse(localStorage.getItem(key)) || {};
        } catch (e) {
            return {};
        }
    },

    getAllDiariesList(userEmail) {
        const diaries = this.getDiaries(userEmail);
        const list = Object.keys(diaries).map(dateKey => ({
            date: dateKey,
            ...diaries[dateKey]
        }));
        // 날짜 내림차순 (최신순) 정렬
        return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getDiary(userEmail, dateKey) {
        const diaries = this.getDiaries(userEmail);
        return diaries[dateKey] || null;
    },

    saveDiary(userEmail, dateKey, diaryData) {
        const diaries = this.getDiaries(userEmail);
        diaries[dateKey] = {
            ...diaryData,
            date: dateKey,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(this.KEYS.DIARIES_PREFIX + userEmail.toLowerCase(), JSON.stringify(diaries));
        return diaries[dateKey];
    },

    deleteDiary(userEmail, dateKey) {
        const diaries = this.getDiaries(userEmail);
        if (diaries[dateKey]) {
            delete diaries[dateKey];
            localStorage.setItem(this.KEYS.DIARIES_PREFIX + userEmail.toLowerCase(), JSON.stringify(diaries));
        }
    },

    // --- Todos (Date-specific YYYY-MM-DD) ---
    getTodosByDate(userEmail, dateKey) {
        const key = this.KEYS.TODOS_PREFIX + userEmail.toLowerCase();
        try {
            const allTodos = JSON.parse(localStorage.getItem(key)) || {};
            return allTodos[dateKey] || [];
        } catch (e) {
            return [];
        }
    },

    getAllTodos(userEmail) {
        const key = this.KEYS.TODOS_PREFIX + userEmail.toLowerCase();
        try {
            return JSON.parse(localStorage.getItem(key)) || {};
        } catch (e) {
            return {};
        }
    },

    saveTodosByDate(userEmail, dateKey, todos) {
        const key = this.KEYS.TODOS_PREFIX + userEmail.toLowerCase();
        const allTodos = this.getAllTodos(userEmail);
        allTodos[dateKey] = todos;
        localStorage.setItem(key, JSON.stringify(allTodos));
    },

    addTodo(userEmail, dateKey, text) {
        const todos = this.getTodosByDate(userEmail, dateKey);
        const newTodo = {
            id: 'todo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        todos.push(newTodo);
        this.saveTodosByDate(userEmail, dateKey, todos);
        return newTodo;
    },

    toggleTodo(userEmail, dateKey, todoId) {
        const todos = this.getTodosByDate(userEmail, dateKey);
        const target = todos.find(t => t.id === todoId);
        if (target) {
            target.completed = !target.completed;
            this.saveTodosByDate(userEmail, dateKey, todos);
        }
        return todos;
    },

    deleteTodo(userEmail, dateKey, todoId) {
        let todos = this.getTodosByDate(userEmail, dateKey);
        todos = todos.filter(t => t.id !== todoId);
        this.saveTodosByDate(userEmail, dateKey, todos);
        return todos;
    },

    // --- YouTube Settings ---
    getYoutubeUrl(userEmail) {
        const key = this.KEYS.YOUTUBE_PREFIX + userEmail.toLowerCase();
        return localStorage.getItem(key) || '';
    },

    saveYoutubeUrl(userEmail, url) {
        const key = this.KEYS.YOUTUBE_PREFIX + userEmail.toLowerCase();
        localStorage.setItem(key, url.trim());
    },

    // --- Initial Seed Data for New Users ---
    initUserData(userEmail, userName) {
        const today = new Date();
        const formatDate = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        const todayKey = formatDate(today);

        // 어제 날짜
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = formatDate(yesterday);

        // 오늘 일기
        this.saveDiary(userEmail, todayKey, {
            weather: 'sunny',
            title: '정원에 첫 발을 내딛은 날 🌿',
            content: `안녕하세요, ${userName}님의 아늑한 모닝 가든 다이어리가 시작되었습니다.\n오늘의 햇살과 작은 생각들, 소중한 순간들을 이곳에 편안하게 기록해보세요. 캘린더에서 날짜를 선택하면 언제든 새 일기를 쓰고 할 일을 체크할 수 있습니다.`,
            photos: [],
            hashtags: ['#FirstDay', '#MorningGarden', '#Diary', '#Cozy']
        });

        // 어제 일기 (Journal 탭에 다이어리가 풍성하게 보이도록 시딩)
        this.saveDiary(userEmail, yesterdayKey, {
            weather: 'cloudy',
            title: '따뜻한 차 한 잔과 아침 산책 🍵',
            content: '선선한 바람이 부는 아침, 정원 길을 천천히 걸었습니다. 작은 새소리와 풀잎 냄새 덕분에 마음이 차분해지는 하루였습니다.',
            photos: [],
            hashtags: ['#MorningWalk', '#TeaTime', '#Peaceful']
        });

        // 오늘 투두리스트
        this.saveTodosByDate(userEmail, todayKey, [
            { id: 'todo_init_1', text: '아침 햇살 맞으며 물 한 잔 마시기 💧', completed: true, createdAt: new Date().toISOString() },
            { id: 'todo_init_2', text: '오늘의 모닝 가든 일기 써보기 ✍️', completed: false, createdAt: new Date().toISOString() },
            { id: 'todo_init_3', text: '좋아하는 음악 영상 URL 등록해보기 🎵', completed: false, createdAt: new Date().toISOString() }
        ]);

        // 어제 투두리스트
        this.saveTodosByDate(userEmail, yesterdayKey, [
            { id: 'todo_yest_1', text: '정원 산책 20분 하기 🚶', completed: true, createdAt: yesterday.toISOString() },
            { id: 'todo_yest_2', text: '식물 화분에 물 주기 🌱', completed: true, createdAt: yesterday.toISOString() }
        ]);

        // 기본 추천 BGM (포근한 Lofi 가든 음악)
        this.saveYoutubeUrl(userEmail, 'https://www.youtube.com/watch?v=5qap5aO4i9A');
    }
};

window.StorageManager = StorageManager;
