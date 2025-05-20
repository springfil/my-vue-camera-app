/**
 * Утилиты для работы с идентификаторами
 */

/**
 * Генерирует UUID v4 (универсальный уникальный идентификатор версии 4)
 * @returns {string} Строка UUID в формате xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export const generateUuidV4 = () => {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
};

/**
 * Генерирует идентификатор для медиа-файла с заданным префиксом
 * @param {string} prefix - Префикс идентификатора (например, 'PHOTO', 'VIDEO')
 * @returns {string} Строка в формате PREFIX_UUID или просто UUID если префикс не указан
 */
export const generateMediaId = (prefix = '') => {
    const uuid = generateUuidV4();
    return prefix ? `${prefix}_${uuid}` : uuid;
};
