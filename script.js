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

// Файлы отправляются боту в чат отдельно, не через Web App

// Установка максимальной даты (сегодня)
const dateInput = document.getElementById('date');
const today = new Date();
const maxDate = new Date(today);
maxDate.setDate(today.getDate() - 3); // Минимум 3 дня назад
dateInput.max = today.toISOString().split('T')[0];
dateInput.value = maxDate.toISOString().split('T')[0]; // Устанавливаем дату по умолчанию

// Загрузка файлов через форму отключена
// Файлы должны отправляться боту в чат отдельно
// Оставляем код для возможного будущего использования, но не активируем

// fileUploadArea.addEventListener('click', () => {
//     fileInput.click();
// });

// Загрузка файлов через форму отключена
// Файлы должны отправляться боту в чат отдельно

// Обработчик отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Валидация обязательных полей
    const date = dateInput.value;
    const location = document.getElementById('location').value.trim();
    const lure = document.getElementById('lure').value.trim();
    const comment = document.getElementById('comment').value.trim();
    
    if (!date || !location || !lure || !comment) {
        tg.showAlert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Файлы должны быть отправлены боту отдельно (через чат), НЕ через Web App
    // Web App отправляет ТОЛЬКО текстовые данные из-за ограничения размера Telegram
    
    // Показываем индикатор загрузки
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span>Отправка...';
    
    try {
        // Отправляем ТОЛЬКО текстовые данные через Web App
        // Файлы должны быть отправлены боту отдельно (через чат)
        const formData = {
            date: date,
            location: location,
            lure: lure,
            conditions: document.getElementById('conditions').value.trim(),
            comment: comment,
            hashtags: document.getElementById('hashtags').value.trim()
        };
        
        const jsonData = JSON.stringify(formData);
        const dataSize = jsonData.length;
        console.log('Sending text data only, size:', dataSize, 'bytes');
        console.log('Files should be sent to bot separately');
        
        // Проверяем размер данных (лимит Telegram Web App ~4096 байт)
        const maxDataSize = 4000; // Оставляем небольшой запас
        if (dataSize > maxDataSize) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Отправить отчёт</span>';
            tg.showAlert(
                `Текст слишком длинный для отправки (${Math.round(dataSize/1024)} КБ).\n\n` +
                `Пожалуйста, сократите текст и попробуйте снова.`
            );
            return;
        }
        
        // Отправляем данные в бота
        tg.sendData(jsonData);
        
        console.log('Data sent successfully');
        
        // Показываем сообщение об успешной отправке
        submitBtn.innerHTML = '<span>✅ Отправлено! Обработка...</span>';
        
        // Показываем MainButton для закрытия
        tg.MainButton.setText('Закрыть');
        tg.MainButton.show();
        tg.MainButton.onClick(function() {
            tg.close();
        });
        
        // Закрываем автоматически через 3 секунды
        setTimeout(() => {
            if (tg.isExpanded) {
                tg.close();
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error sending data:', error);
        tg.showAlert('Ошибка при отправке отчёта: ' + (error.message || String(error)));
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Отправить отчёт</span>';
    }
});
