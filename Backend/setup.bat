@echo off
echo Setting up Django Backend...

echo Creating migrations...
python manage.py makemigrations accounts
python manage.py makemigrations chat
python manage.py makemigrations documents

echo Applying migrations...
python manage.py migrate

echo Creating superuser (optional - press Ctrl+C to skip)...
python manage.py createsuperuser

echo Setup complete! You can now run the server with:
echo python manage.py runserver
pause
