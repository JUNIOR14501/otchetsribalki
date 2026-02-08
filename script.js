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

// Файлы загружаются через бота, поэтому загрузка через форму отключена
// Оставляем код для возможного будущего использования, но не активируем

// Функция сжатия изображения
function compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Масштабируем если нужно
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Конвертируем в base64 с качеством
                const compressedData = canvas.toDataURL(file.type, quality);
                const compressedFile = {
                    name: file.name,
                    data: compressedData,
                    type: file.type,
                    size: compressedData.length
                };
                
                resolve(compressedFile);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Обработка загрузки файла
async function handleFileUpload(file) {
    try {
        // Проверяем размер файла (максимум 10 МБ для исходного файла)
        const maxSize = 10 * 1024 * 1024; // 10 МБ
        if (file.size > maxSize) {
            tg.showAlert(`Файл ${file.name} слишком большой. Максимальный размер: 10 МБ`);
            return;
        }
        
        // Сжимаем изображения
        let processedFile;
        if (file.type.startsWith('image/')) {
            processedFile = await compressImage(file, 1920, 0.7);
        } else {
            // Для видео просто читаем как есть
            const reader = new FileReader();
            processedFile = await new Promise((resolve, reject) => {
                reader.onload = (e) => {
                    resolve({
                        name: file.name,
                        data: e.target.result,
                        type: file.type,
                        size: file.size
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        
        // Создаем элемент превью
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.fileName = processedFile.name;
        
        if (processedFile.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = processedFile.data;
            fileItem.appendChild(img);
        } else if (processedFile.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = processedFile.data;
            video.controls = true;
            fileItem.appendChild(video);
        }
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            fileItem.remove();
            uploadedFiles = uploadedFiles.filter(f => f.name !== processedFile.name);
            updateFileCount();
        };
        fileItem.appendChild(removeBtn);
        
        filePreview.appendChild(fileItem);
        
        // Сохраняем файл в массив
        uploadedFiles.push(processedFile);
        
        updateFileCount();
        
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
    
    // Валидация обязательных полей
    const date = dateInput.value;
    const location = document.getElementById('location').value.trim();
    const lure = document.getElementById('lure').value.trim();
    const comment = document.getElementById('comment').value.trim();
    
    if (!date || !location || !lure || !comment) {
        tg.showAlert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Проверяем наличие файлов
    // Файлы должны быть отправлены боту отдельно, или загружены в форме (но не через Web App из-за ограничений)
    const hasFilesInForm = uploadedFiles.length > 0;
    
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
        console.log('Files in form:', uploadedFiles.length, '(will be ignored, use bot chat)');
        
        // Проверяем размер данных (лимит Telegram Web App ~4096 байт)
        const maxDataSize = 4000; // Оставляем небольшой запас
        if (dataSize > maxDataSize) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Отправить отчёт</span>';
            tg.showAlert(
                `Данные слишком большие для отправки.\n\n` +
                `Пожалуйста, сократите текст и попробуйте снова.`
            );
            return;
        }
        
        // Отправляем данные в бота
        tg.sendData(jsonData);
        
        console.log('Data sent successfully');
        
        // Показываем сообщение об успешной отправке
        if (hasFilesInForm) {
            submitBtn.innerHTML = '<span>⚠️ Отправлено (файлы нужно отправить боту)</span>';
            tg.showAlert(
                'Текстовые данные отправлены!\n\n' +
                'ВАЖНО: Файлы нужно отправить боту в чат отдельно, иначе отчёт не будет принят.'
            );
        } else {
            submitBtn.innerHTML = '<span>✅ Отправлено! Обработка...</span>';
        }
        
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
