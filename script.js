// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Установка цвета темы
tg.setHeaderColor('#1e3c72');
tg.setBackgroundColor('#667eea');

// Обработчик события отправки данных
tg.onEvent('viewportChanged', function(event) {
    console.log('Viewport changed:', event);
});

// Обработчик закрытия Web App
tg.onEvent('close', function() {
    console.log('Web App closed');
});

// Обработчик получения данных от бота
tg.onEvent('mainButtonClicked', function() {
    console.log('Main button clicked');
});

// Включаем MainButton для закрытия после отправки
tg.MainButton.setText('Закрыть');
tg.MainButton.hide();

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
    
    console.log('Form data:', formData);
    
    // Валидация обязательных полей
    if (!formData.date || !formData.location || !formData.lure || !formData.comment) {
        tg.showAlert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Показываем индикатор загрузки
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span>Отправка...';
    
    try {
        const jsonData = JSON.stringify(formData);
        console.log('Sending data:', jsonData);
        console.log('Telegram WebApp object:', tg);
        console.log('sendData method exists:', typeof tg.sendData === 'function');
        
        // Проверяем, что метод sendData доступен
        if (typeof tg.sendData !== 'function') {
            throw new Error('sendData method is not available');
        }
        
        // Отправляем данные в бота (file_ids будут добавлены на стороне бота)
        tg.sendData(jsonData);
        
        console.log('Data sent successfully via sendData');
        
        // Показываем сообщение об успешной отправке
        submitBtn.innerHTML = '<span>✅ Отправлено! Обработка...</span>';
        
        // Показываем MainButton для закрытия
        tg.MainButton.setText('Закрыть');
        tg.MainButton.show();
        tg.MainButton.onClick(function() {
            tg.close();
        });
        
        // Также закрываем автоматически через 3 секунды, если пользователь не закрыл вручную
        setTimeout(() => {
            if (tg.isExpanded) {
                tg.close();
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error sending data:', error);
        console.error('Error stack:', error.stack);
        tg.showAlert('Ошибка при отправке отчёта: ' + (error.message || String(error)));
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Отправить отчёт</span>';
    }
});

// Drag and drop отключен, так как файлы загружаются через бота
