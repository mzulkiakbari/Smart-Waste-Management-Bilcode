FROM php:8.3-cli-alpine

WORKDIR /var/www

# Install system dependencies & PHP extensions for Supabase PostgreSQL
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    postgresql-dev \
    oniguruma-dev

RUN docker-php-ext-install pdo pdo_pgsql pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . .

# Run composer install
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
