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

// Массив для хранения файлов в base64
let uploadedFiles = [];

// Установка максимальной даты (сегодня)
const dateInput = document.getElementById('date');
const today = new Date();
const maxDate = new Date(today);
maxDate.setDate(today.getDate() - 3); // Минимум 3 дня назад
dateInput.max = today.toISOString().split('T')[0];
dateInput.value = maxDate.toISOString().split('T')[0]; // Устанавливаем дату по умолчанию

// Обработчик клика на область загрузки файлов
fileUploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Обработчик выбора файлов
fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
        await handleFileUpload(file);
    }
    
    // Очищаем input для возможности повторного выбора того же файла
    fileInput.value = '';
});

// Обработка загрузки файла
async function handleFileUpload(file) {
    try {
        // Проверяем размер файла (максимум 20 МБ)
        const maxSize = 20 * 1024 * 1024; // 20 МБ
        if (file.size > maxSize) {
            tg.showAlert(`Файл ${file.name} слишком большой. Максимальный размер: 20 МБ`);
            return;
        }
        
        // Читаем файл как base64
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const base64Data = e.target.result;
            
            // Создаем элемент превью
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.fileName = file.name;
            
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = base64Data;
                fileItem.appendChild(img);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = base64Data;
                video.controls = true;
                fileItem.appendChild(video);
            }
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => {
                fileItem.remove();
                uploadedFiles = uploadedFiles.filter(f => f.name !== file.name);
                updateFileCount();
            };
            fileItem.appendChild(removeBtn);
            
            filePreview.appendChild(fileItem);
            
            // Сохраняем файл в массив
            uploadedFiles.push({
                name: file.name,
                data: base64Data,
                type: file.type,
                size: file.size
            });
            
            updateFileCount();
        };
        
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            tg.showAlert('Ошибка при чтении файла');
        };
        
        // Читаем файл как Data URL (base64)
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Error uploading file:', error);
        tg.showAlert('Ошибка при загрузке файла. Попробуйте ещё раз.');
    }
}

// Обновление счетчика файлов
function updateFileCount() {
    const count = uploadedFiles.length;
    if (count > 0) {
        const placeholder = fileUploadArea.querySelector('.upload-placeholder p');
        if (placeholder) {
            placeholder.textContent = `Загружено файлов: ${count}`;
        }
    }
}

// Обработка drag and drop
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#667eea';
    fileUploadArea.style.background = '#f0f4ff';
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.style.borderColor = '#bdc3c7';
    fileUploadArea.style.background = '#f8f9fa';
});

fileUploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#bdc3c7';
    fileUploadArea.style.background = '#f8f9fa';
    
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            await handleFileUpload(file);
        }
    }
});

// Обработчик отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Валидация файлов
    if (uploadedFiles.length === 0) {
        tg.showAlert('Пожалуйста, прикрепите хотя бы одно фото или видео');
        return;
    }
    
    // Получаем данные формы
    const formData = {
        date: dateInput.value,
        location: document.getElementById('location').value.trim(),
        lure: document.getElementById('lure').value.trim(),
        conditions: document.getElementById('conditions').value.trim(),
        comment: document.getElementById('comment').value.trim(),
        hashtags: document.getElementById('hashtags').value.trim(),
        files: uploadedFiles.map(f => ({
            data: f.data,
            type: f.type
        }))
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
        const jsonData = JSON.stringify(formData);
        console.log('Sending data, files count:', uploadedFiles.length);
        
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
