// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Установка цвета темы
tg.setHeaderColor('#1e3c72');
tg.setBackgroundColor('#667eea');

// Элементы формы
const form = document.getElementById('reportForm');
const fileInput = document.getElementById('fileInput');
const fileUploadArea = document.getElementById('fileUploadArea');
const filePreview = document.getElementById('filePreview');
const submitBtn = document.getElementById('submitBtn');

// Установка максимальной даты (сегодня)
const dateInput = document.getElementById('date');
const today = new Date();
const maxDate = new Date(today);
maxDate.setDate(today.getDate() - 3); // Минимум 3 дня назад
dateInput.max = today.toISOString().split('T')[0];
dateInput.value = maxDate.toISOString().split('T')[0]; // Устанавливаем дату по умолчанию

// Информация о том, что файлы нужно отправлять боту
const fileInfo = document.createElement('div');
fileInfo.className = 'file-info';
fileInfo.innerHTML = '<p style="color: #667eea; font-weight: 600; margin-bottom: 10px;">📎 Файлы нужно отправить боту перед заполнением формы!</p>';
fileUploadArea.parentElement.insertBefore(fileInfo, fileUploadArea);

// Файлы загружаются через бота, поэтому здесь только информационное сообщение
fileUploadArea.style.opacity = '0.6';
fileUploadArea.style.cursor = 'not-allowed';
fileUploadArea.innerHTML = `
    <div class="upload-placeholder">
        <span class="upload-icon">ℹ️</span>
        <p>Файлы нужно отправить боту</p>
        <small>Отправьте фото/видео боту в чат, затем заполните эту форму</small>
    </div>
`;

// Обработчик отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Получаем данные формы
    const formData = {
        date: dateInput.value,
        location: document.getElementById('location').value.trim(),
        lure: document.getElementById('lure').value.trim(),
        conditions: document.getElementById('conditions').value.trim(),
        comment: document.getElementById('comment').value.trim(),
        hashtags: document.getElementById('hashtags').value.trim()
    };
    
    // Валидация обязательных полей
    if (!formData.date || !formData.location || !formData.lure || !formData.comment) {
        tg.showAlert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Показываем индикатор загрузки
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span>Отправка...';
    
    try {
        // Отправляем данные в бота (file_ids будут добавлены на стороне бота)
        tg.sendData(JSON.stringify(formData));
        
        // Закрываем Web App
        setTimeout(() => {
            tg.close();
        }, 1000);
        
    } catch (error) {
        console.error('Error sending data:', error);
        tg.showAlert('Ошибка при отправке отчёта. Попробуйте ещё раз.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Отправить отчёт</span>';
    }
});

// Drag and drop отключен, так как файлы загружаются через бота
