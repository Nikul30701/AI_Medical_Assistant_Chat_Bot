#!/bin/bash

echo "Setting up Django Backend..."

# Create migrations
echo "Creating migrations..."
python manage.py makemigrations accounts
python manage.py makemigrations chat
python manage.py makemigrations documents

# Apply migrations
echo "Applying migrations..."
python manage.py migrate

# Create superuser (optional)
echo "Creating superuser (optional - press Ctrl+C to skip)..."
python manage.py createsuperuser

echo "Setup complete! You can now run the server with:"
echo "python manage.py runserver"

echo "daphne -b 127.0.0.1 -p 8000 My_Porject.asgi:application"
